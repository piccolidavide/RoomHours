import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { UploadData } from "../types/Types";

let instance: SupabaseClient | null = null;

if (!instance) {
	instance = createClient(
		import.meta.env.VITE_SUPABASE_URL,
		import.meta.env.VITE_SUPABASE_ANON_KEY,
	);
}

export const supabase = instance;

/* async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
} */
const signUp = async (
	username: string,
	age: number,
	email: string,
	password: string,
) => {
	// console.log("Attempting signUp with:", { username, email, age });

	try {
		// Registrazione utente con Supabase
		const { data, error } = await supabase.auth.signUp({
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
		const { error: profileError } = await supabase
			.from("users")
			.insert([{ id: data.user.id, username, age, email }]);

		if (profileError) {
			throw new Error(
				`Errore durante il salvataggio del profilo: ${profileError.message}`,
			);
		}

		return { user: data.user, success: true };
	} catch (err) {
		throw err; // Rilancia l'errore per gestirlo nel chiamante
	}
};

const signIn = async (email: string, password: string) => {
	try {
		const { data, error } = await supabase.auth.signInWithPassword({
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
		await supabase.auth.signOut();
		// User is signed out
	} catch (error) {
		// Handle signout error
		throw error;
	}
};

const getCurrentUser = async () => {
	try {
		const { data } = await supabase.auth.getUser();

		return data.user;
	} catch (error) {
		throw error;
	}
};

const onAuthStateChange = (callback: (user: any) => void) => {
	const { data: authListener } = supabase.auth.onAuthStateChange(
		(_event, session) => {
			callback(session?.user ?? null);
		},
	);

	return () => {
		authListener.subscription.unsubscribe();
	};
};

const uploadRoomData = async (
	roomNames: string[],
	data: UploadData[],
): Promise<{ success: boolean; error?: string }> => {
	const user = await getCurrentUser();
	if (!user) {
		return { success: false, error: "Utente non autenticato." };
	}

	const roomNamesId: { [name: string]: string } = {};

	// Salvo le stanze nel database se non esistono già
	for (const roomName of roomNames) {
		// Controllo se la stanza esiste già
		const { data: existingRoom, error: fetchError } = await supabase
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
			const { data: roomData, error: insertError } = await supabase
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

	console.log("Room names inserted successfully: ", roomNamesId);

	let insertedEntries = 0;
	for (const entry of data) {
		const timestamp = new Date(entry.Timestamp);
		if (isNaN(timestamp.getTime())) {
			continue; // Salta questa entry se il timestamp non è valido
		}

		const roomWithData = Object.keys(entry).find((key) => entry[key] == 1);

		if (roomWithData) {
			const { error: insertError } = await supabase
				.from("room_usage")
				.insert({
					user_id: user.id,
					room_id: roomNamesId[roomWithData],
					timestamp,
					presence: true,
				});

			if (insertError) {
				console.error("Errore nell'inserimento dei dati:", insertError);
				continue; // Salta questa entry e continua con la successiva
			}

			insertedEntries++;
		}
	}

	console.log("Inserted entries:", insertedEntries);
	return { success: true };
};

export default supabase;
export {
	signUp,
	signIn,
	signOut,
	getCurrentUser,
	onAuthStateChange,
	uploadRoomData,
};
