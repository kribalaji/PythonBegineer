from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.uix.spinner import Spinner
from kivy.uix.button import Button
from kivy.uix.scrollview import ScrollView
from kivy.uix.popup import Popup

# Constants for default dropdown values
DEFAULT_COUNTRY = "Select Country"
DEFAULT_STATE = "Select State"
DEFAULT_CITY = "Select City"

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

# Main layout for the Resume Builder
class ResumeBuilder(BoxLayout):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.orientation = "vertical"
        self.padding = [20, 20, 20, 20]  # Padding: [left, top, right, bottom]
        self.spacing = 10  # Space between widgets

        # Scrollable layout
        scroll_view = ScrollView(size_hint=(1, None), size=(self.width, self.height))
        content = BoxLayout(orientation="vertical", size_hint_y=None, spacing=15)
        content.bind(minimum_height=content.setter("height"))
        scroll_view.add_widget(content)

        # First Name
        content.add_widget(Label(text="First Name:", size_hint_y=None, height=30))
        self.first_name_input = TextInput(hint_text="Enter your first name", size_hint_y=None, height=40)
        content.add_widget(self.first_name_input)

        # Last Name
        content.add_widget(Label(text="Last Name:", size_hint_y=None, height=30))
        self.last_name_input = TextInput(hint_text="Enter your last name", size_hint_y=None, height=40)
        content.add_widget(self.last_name_input)

        # Suffix
        content.add_widget(Label(text="Suffix:", size_hint_y=None, height=30))
        self.suffix_spinner = Spinner(
            text="Select",
            values=["Mr", "Ms", "Mrs"],
            size_hint_y=None,
            height=40,
        )
        content.add_widget(self.suffix_spinner)

        # Employee ID
        content.add_widget(Label(text="Employee ID:", size_hint_y=None, height=30))
        self.employee_id_input = TextInput(hint_text="Enter your employee ID", size_hint_y=None, height=40)
        content.add_widget(self.employee_id_input)

        # Mobile Number
        content.add_widget(Label(text="Mobile Number:", size_hint_y=None, height=30))
        self.mobile_number_input = TextInput(hint_text="Enter your mobile number", size_hint_y=None, height=40)
        content.add_widget(self.mobile_number_input)

        # Country Code
        content.add_widget(Label(text="Country Code:", size_hint_y=None, height=30))
        self.country_spinner = Spinner(
            text=DEFAULT_COUNTRY,
            values=[DEFAULT_COUNTRY] + list(location_data.keys()),
            size_hint_y=None,
            height=40,
        )
        self.country_spinner.bind(text=self.update_states)
        content.add_widget(self.country_spinner)

        # State
        content.add_widget(Label(text="State:", size_hint_y=None, height=30))
        self.state_spinner = Spinner(
            text=DEFAULT_STATE,
            values=[],
            size_hint_y=None,
            height=40,
        )
        self.state_spinner.bind(text=self.update_cities)
        content.add_widget(self.state_spinner)

        # City
        content.add_widget(Label(text="City:", size_hint_y=None, height=30))
        self.city_spinner = Spinner(
            text=DEFAULT_CITY,
            values=[],
            size_hint_y=None,
            height=40,
        )
        content.add_widget(self.city_spinner)

        # Submit Button
        self.submit_button = Button(text="Submit", size_hint=(1, None), height=50)
        self.submit_button.bind(on_press=self.submit_form)
        content.add_widget(self.submit_button)

        # Add scrollable content to the main layout
        self.add_widget(scroll_view)

    def update_states(self, spinner, country):
        """Update the states dropdown based on the selected country."""
        try:
            if country in location_data:
                self.state_spinner.values = [DEFAULT_STATE] + list(location_data[country].keys())
                self.state_spinner.text = DEFAULT_STATE
                self.city_spinner.values = []  # Reset city dropdown
                self.city_spinner.text = DEFAULT_CITY
            else:
                self.state_spinner.values = []
                self.state_spinner.text = DEFAULT_STATE
                self.city_spinner.values = []
                self.city_spinner.text = DEFAULT_CITY
        except Exception as e:
            print(f"Error updating states: {e}")

    def update_cities(self, spinner, state):
        """Update the cities dropdown based on the selected state."""
        try:
            country = self.country_spinner.text
            if country in location_data and state in location_data[country]:
                self.city_spinner.values = [DEFAULT_CITY] + location_data[country][state]
                self.city_spinner.text = DEFAULT_CITY
            else:
                self.city_spinner.values = []
                self.city_spinner.text = DEFAULT_CITY
        except Exception as e:
            print(f"Error updating cities: {e}")

    def submit_form(self, instance):
        """Handle form submission."""
        try:
            first_name = self.first_name_input.text
            last_name = self.last_name_input.text
            suffix = self.suffix_spinner.text
            employee_id = self.employee_id_input.text
            mobile_number = self.mobile_number_input.text
            country = self.country_spinner.text
            state = self.state_spinner.text
            city = self.city_spinner.text

            # Validate required fields
            if not first_name or not last_name or not employee_id or not mobile_number or country == DEFAULT_COUNTRY or state == DEFAULT_STATE or city == DEFAULT_CITY:
                self.show_popup("Error", "All fields are required!")
                return

            # Validate mobile number
            if not mobile_number.isdigit() or len(mobile_number) != 10:
                self.show_popup("Error", "Invalid mobile number! Must be 10 digits.")
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
            self.show_popup("Success", resume_details)
        except Exception as e:
            print(f"Error submitting form: {e}")

    def show_popup(self, title, message):
        """Display a popup with the given title and message."""
        popup_content = BoxLayout(orientation="vertical", padding=10, spacing=10)
        popup_content.add_widget(Label(text=message))
        close_button = Button(text="Close", size_hint=(1, 0.2))
        popup = Popup(title=title, content=popup_content, size_hint=(0.8, 0.5))
        close_button.bind(on_press=popup.dismiss)
        popup_content.add_widget(close_button)
        popup.open()


# Main application class
class ResumeBuilderApp(App):
    def build(self):
        return ResumeBuilder()


# Run the application
if __name__ == "__main__":
    ResumeBuilderApp().run()