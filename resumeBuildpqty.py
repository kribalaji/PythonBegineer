from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QLabel, QLineEdit, QComboBox, QPushButton, QVBoxLayout, QWidget, QMessageBox
)

# Sample location data for countries, states, and cities
location_data = {
    "India": {
        "TamilNadu": ["Chennai", "Coimbatore", "Madurai"],
        "Karnataka": ["Bangalore", "Mysore", "Hubli"],
    },
    "USA": {
        "California": ["Los Angeles", "San Francisco", "San Diego"],
        "Texas": ["Houston", "Austin", "Dallas"],
    },
}

class ResumeBuilder(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Resume Builder")
        self.setGeometry(100, 100, 400, 500)

        # Main layout
        layout = QVBoxLayout()

        # First Name
        layout.addWidget(QLabel("First Name:"))
        self.first_name_input = QLineEdit()
        layout.addWidget(self.first_name_input)

        # Last Name
        layout.addWidget(QLabel("Last Name:"))
        self.last_name_input = QLineEdit()
        layout.addWidget(self.last_name_input)

        # Suffix
        layout.addWidget(QLabel("Suffix:"))
        self.suffix_combo = QComboBox()
        self.suffix_combo.addItems(["Select", "Mr", "Ms", "Mrs"])
        layout.addWidget(self.suffix_combo)

        # Employee ID
        layout.addWidget(QLabel("Employee ID:"))
        self.employee_id_input = QLineEdit()
        layout.addWidget(self.employee_id_input)

        # Mobile Number
        layout.addWidget(QLabel("Mobile Number:"))
        self.mobile_number_input = QLineEdit()
        layout.addWidget(self.mobile_number_input)

        # Country
        layout.addWidget(QLabel("Country:"))
        self.country_combo = QComboBox()
        self.country_combo.addItems(["Select Country"] + list(location_data.keys()))
        self.country_combo.currentTextChanged.connect(self.update_states)
        layout.addWidget(self.country_combo)

        # State
        layout.addWidget(QLabel("State:"))
        self.state_combo = QComboBox()
        self.state_combo.addItems(["Select State"])
        self.state_combo.currentTextChanged.connect(self.update_cities)
        layout.addWidget(self.state_combo)

        # City
        layout.addWidget(QLabel("City:"))
        self.city_combo = QComboBox()
        self.city_combo.addItems(["Select City"])
        layout.addWidget(self.city_combo)

        # Submit Button
        self.submit_button = QPushButton("Submit")
        self.submit_button.clicked.connect(self.submit_form)
        layout.addWidget(self.submit_button)

        # Set central widget
        container = QWidget()
        container.setLayout(layout)
        self.setCentralWidget(container)

    def update_states(self, country):
        """Update the states dropdown based on the selected country."""
        self.state_combo.clear()
        self.city_combo.clear()
        self.state_combo.addItem("Select State")
        self.city_combo.addItem("Select City")
        if country in location_data:
            self.state_combo.addItems(location_data[country].keys())

    def update_cities(self, state):
        """Update the cities dropdown based on the selected state."""
        country = self.country_combo.currentText()
        self.city_combo.clear()
        self.city_combo.addItem("Select City")
        if country in location_data and state in location_data[country]:
            self.city_combo.addItems(location_data[country][state])

    def submit_form(self):
        """Handle form submission."""
        first_name = self.first_name_input.text()
        last_name = self.last_name_input.text()
        suffix = self.suffix_combo.currentText()
        employee_id = self.employee_id_input.text()
        mobile_number = self.mobile_number_input.text()
        country = self.country_combo.currentText()
        state = self.state_combo.currentText()
        city = self.city_combo.currentText()

        # Validate required fields
        if not first_name or not last_name or not employee_id or not mobile_number or country == "Select Country" or state == "Select State" or city == "Select City":
            QMessageBox.warning(self, "Error", "All fields are required!")
            return

        # Validate mobile number
        if not mobile_number.isdigit() or len(mobile_number) != 10:
            QMessageBox.warning(self, "Error", "Invalid mobile number! Must be 10 digits.")
            return

        # Display the collected data
        resume_details = f"""
        Resume Details:
        Name: {suffix} {first_name} {last_name}
        Employee ID: {employee_id}
        Mobile Number: {mobile_number}
        Country: {country}
        State: {state}
        City: {city}
        """
        QMessageBox.information(self, "Success", resume_details)


# Run the application
if __name__ == "__main__":
    app = QApplication([])
    window = ResumeBuilder()
    window.show()
    app.exec_()