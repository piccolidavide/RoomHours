import { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { formatDate, getDateFromString } from "./FormatDate";

interface DatePickerProps {
	dateChange: (date: Date) => void; //function to use when date is changed
	usableDates: string[]; //array of selectable dates in the datepicker
	selectedDate: Date; //curret seleected date
}

const DatePicker = ({ dateChange, usableDates, selectedDate }: DatePickerProps) => {
	const [currentSelectedDate, setCurrentSelectedDate] = useState(selectedDate);
	usableDates.sort();

	const handleDateChange = (event: React.ChangeEvent<HTMLInputElement> | "prev" | "next") => {
		let newDate: Date;

		if (typeof event === "string") {
			const currentDateDay = formatDate(currentSelectedDate);

			const index = usableDates.indexOf(currentDateDay);
			const newIndex =
				event === "prev" ? Math.max(0, index - 1) : Math.min(usableDates.length - 1, index + 1);

			newDate = newIndex >= 0 ? getDateFromString(usableDates[newIndex]) : selectedDate;
		} else {
			newDate = getDateFromString(event.target.value);
		}

		setCurrentSelectedDate(newDate || selectedDate);
		dateChange(newDate);
	};

	return (
		<InputGroup className="date-picker">
			<Button variant="primary" onClick={() => handleDateChange("prev")}>
				<FaChevronLeft />
			</Button>
			<Form.Control
				type="date"
				value={formatDate(selectedDate)}
				onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleDateChange(event)}
				min={usableDates[0]}
				max={usableDates[usableDates.length - 1]}
				// style={{ textAlign: "center" }}
			/>
			<Button variant="primary" onClick={() => handleDateChange("next")}>
				<FaChevronRight />
			</Button>
		</InputGroup>
	);
};

export default DatePicker;
