export type RoomsData = {
	Timestamp: string;
	[roomName: string]: string | number;
};

export type Period = {
	user_id: string;
	room_id: string | null;
	start_timestamp: string;
	end_timestamp: string;
	value: number;
};

export type RoomsUsageData = {
	user_id: string;
	username: string;
	room_name: string | null;
	start_timestamp: Date;
	end_timestamp: Date;
	value: number;
};
