import gradio as gr
import pandas as pd  # For reading the CSV file
import re  # For date validation

# Load location data from CSV
def load_location_data(csv_file):
    """Load location data from a CSV file and return as a dictionary."""
    df = pd.read_csv(csv_file)
    location_data = {}
    for state, city in zip(df["State"], df["City"]):
        if state not in location_data:
            location_data[state] = []
        location_data[state].append(city)
    return location_data

# Load the CSV file into location_data
location_data = load_location_data("Indian_Cities_Database_Kaggle.csv")
print(location_data)

# Function to validate date formats
def validate_date(date):
    if not date:
        return True  # Allow empty end date for "in progress"
    pattern = r"^(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/\d{4}$|^(0[1-9]|1[0-2])/\d{4}$"
    return bool(re.match(pattern, date))

# Function to collect details
def collect_details(name, email, mobile, country, state, city, photo, projects):
    # Validate required fields
    if not name or not email or not mobile or not country or not state or not city:
        return "Error: All fields (Name, Email, Mobile, Country, State, City) are required."

    if photo and not photo.lower().endswith(('.png', '.jpg', '.jpeg')):
        return "Error: Please upload a valid image file (PNG, JPG, JPEG)."

    # Validate projects
    for project in projects:
        if not project["project_name"] or not project["project_description"] or not project["tools_used"] or not project["roles"]:
            return "Error: All project-related fields (Project Name, Description, Tools Used, Roles) are required."
        if not validate_date(project["start_date"]):
            return f"Error: Invalid Start Date format for project '{project['project_name']}'. Use MM/DD/YYYY or MM/YYYY."
        if not validate_date(project["end_date"]):
            return f"Error: Invalid End Date format for project '{project['project_name']}'. Use MM/DD/YYYY or MM/YYYY."

    # Format the collected details
    details = f"""
    **Name**: {name}
    **Email**: {email}
    **Mobile Number**: {mobile}
    **Country**: {country}
    **State**: {state}
    **City**: {city}
    """
    if photo:
        details += f"**Photo Uploaded Successfully**: {photo}\n\n"
    else:
        details += "**No Photo Uploaded**\n\n"

    details += "**Projects**:\n"
    for project in projects:
        details += f"""
        - **Project Name**: {project['project_name']}
        - **Description**: {project['project_description']}
        - **Tools Used**: {project['tools_used']}
        - **Roles**: {project['roles']}
        - **Start Date**: {project['start_date']}
        - **End Date**: {project['end_date'] or 'In Progress'}
        """
    return details

def update_states(country):
    """Update the states dropdown based on the selected country."""
    if country == "India":  # Assuming the country is India
        return list(location_data.keys())  # Return only the list of states
    return []  # Return an empty list if the country is invalid

def update_cities(country, state):
    """Update the cities dropdown based on the selected country and state."""
    if isinstance(state, list):
        state = state[0]  # Handle cases where state is passed as a list
    if country == "India" and state in location_data:
        cities = location_data[state]
        print(f"Cities for {state}: {cities}")  # Debugging
        return cities  # Return the list of cities for the selected state
    return []  # Return an empty list if the state is invalid

# Define the Gradio interface with custom CSS for background color
with gr.Blocks(title="Professional IT Resume Builder", css=".interface { background-color: #f0f8ff; }") as interface:
    # Add a bold header using Markdown
    gr.Markdown("## **Professional IT Resume Builder**")
    gr.Markdown("### Build your professional IT resume by providing your details below.")

    with gr.Row():
        name = gr.Textbox(label="Name", placeholder="Enter your full name")
        email = gr.Textbox(label="Email", placeholder="Enter your email address")
        mobile = gr.Textbox(label="Mobile Number", placeholder="Enter your mobile number")
    
    with gr.Row():
        # Country dropdown
        country = gr.Dropdown(
            label="Country",
            choices=["India"],  # Only India is supported
            value="India",  # Default value
            interactive=True
        )
        # State dropdown
        state = gr.Dropdown(
            label="State",
            choices=list(location_data.keys()),  # Populate with all states
            value="TamilNadu",  # Default value
            interactive=True
        )
        # City dropdown
        city = gr.Dropdown(
            label="City",
            choices=location_data.get("TamilNadu", []),  # Populate with cities for TamilNadu
            value="Chennai",  # Default value
            interactive=True
        )
    
    # Link dropdown updates
    country.change(update_states, inputs=country, outputs=state)
    state.change(update_cities, inputs=[country, state], outputs=city)

    photo = gr.Image(label="Upload Photo", type="filepath")

    # Dynamic project addition
    projects = gr.State([])  # To store multiple projects

    def add_project(projects, project_name, project_description, tools_used, roles, start_date, end_date):
        projects.append({
            "project_name": project_name,
            "project_description": project_description,
            "tools_used": tools_used,
            "roles": roles,
            "start_date": start_date,
            "end_date": end_date,
        })
        return projects, gr.update(value=""), gr.update(value=""), gr.update(value=""), gr.update(value=""), gr.update(value=""), gr.update(value="")

    with gr.Accordion("Add Project Details", open=True):
        project_name = gr.Textbox(label="Project Name", placeholder="Enter the project name")
        project_description = gr.Textbox(label="Project Description", placeholder="Describe the project", lines=5)
        tools_used = gr.Textbox(label="Tools Used", placeholder="List the tools/technologies used (comma-separated)")
        roles = gr.Textbox(label="Roles in Project", placeholder="Describe your roles in the project", lines=3)
        start_date = gr.Textbox(label="Start Date", placeholder="MM/DD/YYYY or MM/YYYY")
        end_date = gr.Textbox(label="End Date (Leave blank if in progress)", placeholder="MM/DD/YYYY or MM/YYYY")
        add_button = gr.Button("Add Project")

    add_button.click(
        add_project,
        inputs=[projects, project_name, project_description, tools_used, roles, start_date, end_date],
        outputs=[projects, project_name, project_description, tools_used, roles, start_date, end_date],
    )

    submit_button = gr.Button("Submit")

    # Output section
    output = gr.Markdown(label="Collected Professional Details")

    # Link inputs to the function
    submit_button.click(
        collect_details,
        inputs=[name, email, mobile, country, state, city, photo, projects],
        outputs=output
    )

# Launch the Gradio app
if __name__ == "__main__":
    interface.launch()