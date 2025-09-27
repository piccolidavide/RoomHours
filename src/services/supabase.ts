import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Period, RoomsData, RoomsUsageData } from "../types/Types";
import retrieveRoomUsage from "../utils/RetrieveRoomUsage";
import { toast } from "react-toastify";
import combinePeriodsData from "../utils/CombinePeriodsData";

/**
 * Returns a singleton instance of the Supabase client.
 *
 * Ensures that only one SupabaseClient is created and reused throughout the application
 *
 * @returns [SupabaseClient] The Supabase client instance.
 */
const getSupabaseClient = () => {
	let instance: SupabaseClient | null = null; // Current instance

	return (): SupabaseClient => {
		if (!instance) {
			// If not already created, initialize new client
			instance = createClient(
				import.meta.env.VITE_SUPABASE_URL,
				import.meta.env.VITE_SUPABASE_ANON_KEY,
			);
		}

		return instance;
	};
};
export const supabase = getSupabaseClient();

/**
 * Registers a new user with Supabase authentication and inserts user profile data into the "users" table.
 *
 * @param [username] - The username of the new user.
 * @param [age] - The age of the new user.
 * @param [email] - The email address of the new user.
 * @param [password] - The password for the new user.
 * @returns Resolves with the created user and success status.
 * @throws an error if registration or profile insertion fails.
 */
const signUp = async (username: string, age: number, email: string, password: string) => {
	try {
		// Try to register new user
		const { data, error } = await supabase().auth.signUp({
			email,
			password,
			options: {
				data: {
					username,
					age,
				},
			},
		});

		// Chech for errors
		if (error) {
			throw new Error(error.message);
		}

		if (!data.user) {
			throw new Error("Warning: no user created.");
		}

		// If register was successful, add user to its database table
		const { error: profileError } = await supabase()
			.from("users")
			.insert([{ id: data.user.id, username, age, email }]);

		if (profileError) {
			throw new Error(`Error saving the user to database: ${profileError.message}`);
		}

		// If succesful return the new user and success confirmation
		return { user: data.user, success: true };
	} catch (err) {
		throw err; // If something went bad throws the error
	}
};

/**
 * Authenticates a user trying to log in with the provided credentials.
 *
 * @param [email] - The email address of the user.
 * @param [password] - The password of the user.
 * @returns Resolves with the authentication data if successful.
 * @throws Throws an error if authentication fails.
 */
const signIn = async (email: string, password: string) => {
	try {
		// tri to sign in to database
		const { data, error } = await supabase().auth.signInWithPassword({
			email,
			password,
		});

		if (error) throw error; // If not successful

		// User is signed in, return its data
		return data;
	} catch (error) {
		// Handle signin error
		throw error;
	}
};

/**
 * Signs out the currently authenticated user.
 *
 * @returns Resolves when the user is successfully signed out.
 * @throws Throws an error if signout fails.
 */
const signOut = async () => {
	try {
		await supabase().auth.signOut(); // Try to signout
		// User is signed out
	} catch (error) {
		// Handle signout error
		throw error;
	}
};

/**
 * Retrieves the currently authenticated user.
 *
 * @returns Resolves with the current user object if successful, null if not.
 * @throws Throws an error if retrieval fails.
 */
const getCurrentUser = async () => {
	try {
		const { data } = await supabase().auth.getUser(); // Try to get the current user

		// If succesful return its data
		return data.user;
	} catch (error) {
		throw error; // Handle getUser error
	}
};

/**
 * Subscribes to authentication state changes.
 *
 * Invokes the callback with the current user when authentication state changes
 *
 * @param [callback] - Function to call with the user object when the auth state changes.
 * @returns Unsubscribe function to remove the listener.
 */
const onAuthStateChange = (callback: (user: any) => void) => {
	// Subscribe to state changes with a callback function
	const { data: authListener } = supabase().auth.onAuthStateChange((_event, session) => {
		callback(session?.user ?? null);
	});

	// Return the unsubscribe function
	return () => {
		authListener.subscription.unsubscribe();
	};
};

/**
 * Uploads room data for the authenticated user.
 *
 * If the rooms don't already exist in the database it adds them.
 * Transforms the data into periods for each room,
 * checking if there were any periods already uploade to combine them if necessary.
 *
 * @param [roomNames] - Array of room names to upload.
 * @param [data] - Array of usage data for the rooms at each timestamp
 * @returns Resolves with an object containing success status and optional error message.
 * @throws Throws an error if uploading fails.
 */
const uploadRoomData = async (
	roomNames: string[],
	data: RoomsData[],
): Promise<{ success: boolean; error?: string }> => {
	const user = await getCurrentUser();
	if (!user) {
		return { success: false, error: "User not authenticated." };
	}

	// Maps the room names to their respective id in the database
	const roomNamesId: { [name: string]: string } = {};

	// Try to save the rooms to the database, if not already in
	for (const roomName of roomNames) {
		// Fetch the already existing rooms
		const { data: existingRoom, error: fetchError } = await supabase()
			.from("rooms")
			.select("id")
			.eq("user_id", user.id)
			.eq("name", roomName)
			.maybeSingle();

		if (fetchError && fetchError.code !== "PGRST116") {
			return { success: false, error: fetchError.message };
		}

		if (existingRoom) {
			// if room already exist, maps its id
			roomNamesId[roomName] = existingRoom.id;
		} else {
			// Create new room
			const { data: roomData, error: insertError } = await supabase()
				.from("rooms")
				.insert({ user_id: user.id, name: roomName })
				.select("id")
				.single();

			if (insertError) {
				return { success: false, error: insertError.message };
			}

			roomNamesId[roomName] = roomData.id; // Map the new id to its room name
		}
	}

	// Transorm timestamp value to periods of usage
	let periods = retrieveRoomUsage(user.id, roomNames, roomNamesId, data);
	let alteredRows: string[] = []; // Altered rows if there are periods that overlap

	// Retrieve the data already in the database
	const oldData = await retrieveOldUserData(user.id);

	// If there already was data, try combine the new periods with the old ones
	if (oldData.length > 0)
		[alteredRows, periods] = combinePeriodsData(periods, oldData, Object.values(roomNamesId));

	// Delet the altered rows to upload them with the new period
	if (alteredRows.length > 0) {
		const { error: deleteError } = await supabase()
			.from("rooms_usage_periods")
			.delete()
			.in("id", alteredRows);

		if (deleteError) {
			return { success: false, error: deleteError.message };
		}
	}

	// Insert the periods into database
	const { error: insertError } = await supabase().from("rooms_usage_periods").insert(periods);

	if (insertError) {
		return { success: false, error: insertError.message };
	}

	// Return successful
	return { success: true };
};

/**
 * Retrieves previously uploaded room usage periods for the specified user from the database.
 *
 * @param [userId] - The ID of the user whose room usage data is to be retrieved.
 * @returns Resolves with an array of objects containing row IDs and period data.
 * @throws Throws an error if data retrieval fails.
 */
const retrieveOldUserData = async (userId: string): Promise<{ rowId: string; Period: Period }[]> => {
	//Query to execute
	const query = supabase()
		.from("rooms_usage_periods")
		.select("id, user_id, room_id, start_timestamp, end_timestamp, value")
		.eq("user_id", userId)
		.order("end_timestamp", { ascending: false });

	const data = await getDataFromDb(query);

	// Map the retrieved data to their specific type
	const mappedData: { rowId: string; Period: Period }[] = data.map((item: any) => ({
		rowId: item.id,
		Period: {
			user_id: userId,
			room_id: item.room_id,
			start_timestamp: String(item.start_timestamp),
			end_timestamp: String(item.end_timestamp),
			value: item.value,
		},
	}));

	return mappedData; // Return all the found data
};

/**
 * Retrieves room usage data for the specified user, including room and user details.
 *
 * @param [userId] - The ID of the user to retrieve the data for
 * @returns Resolves with an array of room usage data objects.
 * @throws Throws an error if data retrieval fails.
 */
const retrieveUserData = async (userId: string): Promise<RoomsUsageData[]> => {
	//Query to execute
	const query = supabase()
		.from("rooms_usage_periods")
		.select(
			`start_timestamp,
				end_timestamp,
				value,
				rooms(name),
				users(username)`,
		)
		.eq("user_id", userId)
		.order("end_timestamp", { ascending: true });

	const data = await getDataFromDb(query);

	// Map the retrieved data to their specific type
	const mappedData: RoomsUsageData[] = data.map((item: any) => ({
		user_id: userId,
		username: item.users.username,
		room_name: item.rooms.name,
		start_timestamp: new Date(item.start_timestamp),
		end_timestamp: new Date(item.end_timestamp),
		value: item.value,
	}));

	return mappedData;
};

/**
 * Retrieves all data from the database using a query passed as parameter
 *
 * Iteratively fetches data in batches of 1000 rows until all data is retrieved.
 *
 * @param [query] - The Supabase query object to execute.
 * @returns Resolves with an array containing all retrieved data rows.
 * @throws Throws an error if data retrieval fails.
 */
const getDataFromDb = async (query: any) => {
	const maxRows = 1000;
	let data: any = [];
	let curStart = 0;
	let hasMore = true;

	// Supabase returns max 1000 entries at a time, loop to retrieve every entry
	while (hasMore) {
		// Try to get next 1000 entries
		const { data: newData, error } = await query.range(curStart * maxRows, (curStart + 1) * maxRows - 1);
		if (error) {
			toast.error("Error on loading user data: " + error, {
				autoClose: 3000,
			});
			throw error;
		}

		data = [...data, ...newData]; // save new data
		hasMore = newData.length === maxRows; // Condition for next loop
		curStart++;
	}

	return data;
};

/**
 * Subscribes to real-time changes for room usage periods for the specified user.
 *
 * Invokes the callback when a new usage period is inserted.
 *
 * @param [userId] - The ID of the user to subscribe for changes.
 * @param [onInsert] - Callback function to execute when a new period is inserted.
 * @returns Unsubscribe function to remove the subscription.
 */
const subscribeToRoomUsage = async (userId: string, onInsert: () => void): Promise<() => void> => {
	// Create a channel for subscription
	const channel = supabase()
		.channel("rooms_usage_periods_changes")
		.on(
			"postgres_changes",
			{
				event: "INSERT", // Listen for INSERT events only
				schema: "public", // the schema to subscribe
				table: "rooms_usage_periods", // The table to subscribe to
				filter: `user_id=eq.${userId}`, // Filter for the authenticated user only
			},
			(_payload) => {
				// Call the callback function when there's an insert
				onInsert();
			},
		)
		.subscribe((status) => {
			console.log("Stato sottoscrizione:", status);

			// Check for subscription errors
			if (status === "CLOSED" || status === "CHANNEL_ERROR")
				console.error("Sottoscrizione chiusa o con errore.");
		});

	// remove subscription when component unmounts
	return () => {
		supabase().removeChannel(channel);
	};
};

export default supabase;
export {
	signUp,
	signIn,
	signOut,
	getCurrentUser,
	onAuthStateChange,
	uploadRoomData,
	retrieveUserData,
	subscribeToRoomUsage,
};
