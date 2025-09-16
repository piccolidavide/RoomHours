import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Period, RoomsData, RoomsUsageData } from "../types/Types";
import retrieveRoomUsage from "../utils/RetrieveRoomUsage";
import { toast } from "react-toastify";
import combinePeriodsData from "../utils/CombinePeriodsData";

const getSupabaseClient = () => {
	let instance: SupabaseClient | null = null;

	return (): SupabaseClient => {
		if (!instance) {
			// console.log("Creating Supabase client...");
			instance = createClient(
				import.meta.env.VITE_SUPABASE_URL,
				import.meta.env.VITE_SUPABASE_ANON_KEY,
			);
		}

		return instance;
	};
};
export const supabase = getSupabaseClient();

const signUp = async (username: string, age: number, email: string, password: string) => {
	try {
		// Registrazione utente con Supabase
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

		if (error) {
			throw new Error(error.message);
		}

		if (!data.user) {
			throw new Error("Errore: nessun utente creato.");
		}

		// Inserimento dei dati nella tabella users
		const { error: profileError } = await supabase()
			.from("users")
			.insert([{ id: data.user.id, username, age, email }]);

		if (profileError) {
			throw new Error(`Errore durante il salvataggio del profilo: ${profileError.message}`);
		}

		return { user: data.user, success: true };
	} catch (err) {
		throw err; // Rilancia l'errore per gestirlo nel chiamante
	}
};

const signIn = async (email: string, password: string) => {
	try {
		const { data, error } = await supabase().auth.signInWithPassword({
			email,
			password,
		});

		if (error) throw error;

		// User is signed in, you can access the user object and session
		// console.log(data);
		return data;
	} catch (error) {
		// Handle signin error
		throw error;
	}
};

const signOut = async () => {
	try {
		await supabase().auth.signOut();
		// User is signed out
	} catch (error) {
		// Handle signout error
		throw error;
	}
};

const getCurrentUser = async () => {
	try {
		const { data } = await supabase().auth.getUser();

		return data.user;
	} catch (error) {
		throw error;
	}
};

const onAuthStateChange = (callback: (user: any) => void) => {
	const { data: authListener } = supabase().auth.onAuthStateChange((_event, session) => {
		callback(session?.user ?? null);
	});

	return () => {
		authListener.subscription.unsubscribe();
	};
};

const uploadRoomData = async (
	roomNames: string[],
	data: RoomsData[],
): Promise<{ success: boolean; error?: string }> => {
	const user = await getCurrentUser();
	if (!user) {
		return { success: false, error: "Utente non autenticato." };
	}

	const roomNamesId: { [name: string]: string } = {};

	// Salvo le stanze nel database se non esistono già
	for (const roomName of roomNames) {
		// Controllo se la stanza esiste già
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
			// se esiste già, salvo l'id
			roomNamesId[roomName] = existingRoom.id;
		} else {
			// creo nuova stanza
			const { data: roomData, error: insertError } = await supabase()
				.from("rooms")
				.insert({ user_id: user.id, name: roomName })
				.select("id")
				.single();

			if (insertError) {
				return { success: false, error: insertError.message };
			}

			console.log("Inserted Room:", roomData);
			roomNamesId[roomName] = roomData.id; // salvo il nuovo id
		}
	}

	let periods = retrieveRoomUsage(user.id, roomNames, roomNamesId, data);
	let alteredRows: string[] = [];

	const oldData = await retrieveOldUserData(user.id);

	if (oldData.length > 0)
		[alteredRows, periods] = combinePeriodsData(periods, oldData, Object.values(roomNamesId));

	if (alteredRows.length > 0) {
		const { error: deleteError } = await supabase()
			.from("rooms_usage_periods")
			.delete()
			.in("id", alteredRows);

		if (deleteError) {
			return { success: false, error: deleteError.message };
		}
	}

	const { error: insertError } = await supabase().from("rooms_usage_periods").insert(periods);

	if (insertError) {
		return { success: false, error: insertError.message };
	}

	// console.log(
	// 	"Periods: ",
	// 	periods.map(({ room_id, start_timestamp, end_timestamp, value }) => {
	// 		const roomKey = Object.keys(roomNamesId).find(
	// 			(key) => roomNamesId[key] === room_id,
	// 		);
	// 		const roomName = roomKey ? roomNamesId[roomKey] : "unknown";
	// 		return `${roomName} - ${
	// 			start_timestamp ? start_timestamp.toISOString() : "null"
	// 		} - ${
	// 			end_timestamp ? end_timestamp.toISOString() : "null"
	// 		} - ${value}`;
	// 	}),
	// );

	return { success: true };
};

const retrieveOldUserData = async (userId: string): Promise<{ rowId: string; Period: Period }[]> => {
	const query = supabase()
		.from("rooms_usage_periods")
		.select("id, user_id, room_id, start_timestamp, end_timestamp, value")
		.eq("user_id", userId)
		.order("end_timestamp", { ascending: false });

	const { data, error } = await query;
	if (error) {
		toast.error("Errore nel caricamento dei dati: " + error, {
			autoClose: 3000,
		});
		throw error;
	}

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

	return mappedData;
};

const retrieveUserData = async (userId: string): Promise<RoomsUsageData[]> => {
	const maxRows = 1000;
	let data: any = [];
	let curStart = 0;
	let hasMore = true;

	while (hasMore) {
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
			.order("end_timestamp", { ascending: true })
			.range(curStart * maxRows, (curStart + 1) * maxRows - 1);

		const { data: newData, error } = await query;
		if (error) {
			toast.error("Errore nel caricamento dei dati: " + error, {
				autoClose: 3000,
			});
			throw error;
		}

		data = [...data, ...newData];
		hasMore = newData.length === maxRows;
		curStart++;
	}

	// console.log("Data: ", data.length);

	const mappedData: RoomsUsageData[] = data.map((item: any) => ({
		user_id: userId,
		username: item.users.username,
		room_name: item.rooms ? item.rooms.name : null,
		start_timestamp: new Date(item.start_timestamp),
		end_timestamp: new Date(item.end_timestamp),
		value: item.value,
	}));

	return mappedData;
};

const subscribeToRoomUsage = async (userId: string, onInsert: () => void): Promise<() => void> => {
	// console.log("Sottoscrizione in corso..."); // Crea un canale per la sottoscrizione

	const channel = supabase()
		.channel("rooms_usage_periods_changes")
		.on(
			"postgres_changes",
			{
				event: "INSERT", // Ascolta solo gli INSERT
				schema: "public", // Assumi schema pubblico
				table: "rooms_usage_periods",
				filter: `user_id=eq.${userId}`, // Filtra per user_id dell'utente autenticato
			},
			(_payload) => {
				// Ricarica i dati quando c'è un INSERT
				onInsert();
			},
		)
		.subscribe((status) => {
			// console.log("Stato sottoscrizione:", status);

			if (status === "CLOSED" || status === "CHANNEL_ERROR")
				console.error("Sottoscrizione chiusa o con errore.");
		});

	// Cleanup: rimuovi la sottoscrizione quando il componente si smonta
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
