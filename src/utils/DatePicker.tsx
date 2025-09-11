import { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const DatePicker = ({ dateChange }: { dateChange: (date: Date) => void }) => {
	const [selectedDate, setSelectedDate] = useState(new Date());

	const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newDate = new Date(event.target.value);
		if (!isNaN(newDate.getTime())) {
			setSelectedDate(newDate);
			dateChange(newDate);
		}
	};

	const handlePrevDay = () => {
		const prevDate = new Date(selectedDate);
		prevDate.setDate(prevDate.getDate() - 1);
		setSelectedDate(prevDate);
		dateChange(prevDate);
	};

	const handleNextDay = () => {
		const nextDate = new Date(selectedDate);
		nextDate.setDate(nextDate.getDate() + 1);
		setSelectedDate(nextDate);
		dateChange(nextDate);
	};

	const format = (date: Date) => date.toISOString().split("T")[0];

	return (
		<InputGroup className="date-picker">
			<Button variant="secondary" onClick={handlePrevDay}>
				<FaChevronLeft />
			</Button>
			<Form.Control
				type="date"
				value={format(selectedDate)}
				onChange={handleDateChange}
				style={{ textAlign: "center" }}
			/>
			<Button variant="secondary" onClick={handleNextDay}>
				<FaChevronRight />
			</Button>
		</InputGroup>
	);
};

export default DatePicker;
