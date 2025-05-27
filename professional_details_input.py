import gradio as gr
import re  # For date validation

# Updated data for countries, states, and cities
location_data = {
    "USA": {
        "Alabama": ["Birmingham", "Montgomery", "Mobile"],
        "Alaska": ["Anchorage", "Fairbanks", "Juneau"],
        "Arizona": ["Phoenix", "Tucson", "Mesa"],
        "Arkansas": ["Little Rock", "Fort Smith", "Fayetteville"],
        "California": ["Los Angeles", "San Francisco", "San Diego"],
        "Colorado": ["Denver", "Colorado Springs", "Aurora"],
        "Connecticut": ["Bridgeport", "New Haven", "Hartford"],
        "Delaware": ["Wilmington", "Dover", "Newark"],
        "Florida": ["Miami", "Orlando", "Tampa"],
        "Georgia": ["Atlanta", "Savannah", "Augusta"],
        "Hawaii": ["Honolulu", "Hilo", "Kailua"],
        "Idaho": ["Boise", "Meridian", "Nampa"],
        "Illinois": ["Chicago", "Aurora", "Naperville"],
        "Indiana": ["Indianapolis", "Fort Wayne", "Evansville"],
        "Iowa": ["Des Moines", "Cedar Rapids", "Davenport"],
        "Kansas": ["Wichita", "Overland Park", "Kansas City"],
        "Kentucky": ["Louisville", "Lexington", "Bowling Green"],
        "Louisiana": ["New Orleans", "Baton Rouge", "Shreveport"],
        "Maine": ["Portland", "Lewiston", "Bangor"],
        "Maryland": ["Baltimore", "Frederick", "Rockville"],
        "Massachusetts": ["Boston", "Worcester", "Springfield"],
        "Michigan": ["Detroit", "Grand Rapids", "Warren"],
        "Minnesota": ["Minneapolis", "Saint Paul", "Rochester"],
        "Mississippi": ["Jackson", "Gulfport", "Southaven"],
        "Missouri": ["Kansas City", "Saint Louis", "Springfield"],
        "Montana": ["Billings", "Missoula", "Great Falls"],
        "Nebraska": ["Omaha", "Lincoln", "Bellevue"],
        "Nevada": ["Las Vegas", "Reno", "Henderson"],
        "New Hampshire": ["Manchester", "Nashua", "Concord"],
        "New Jersey": ["Newark", "Jersey City", "Paterson"],
        "New Mexico": ["Albuquerque", "Las Cruces", "Santa Fe"],
        "New York": ["New York City", "Buffalo", "Rochester"],
        "North Carolina": ["Charlotte", "Raleigh", "Greensboro"],
        "North Dakota": ["Fargo", "Bismarck", "Grand Forks"],
        "Ohio": ["Columbus", "Cleveland", "Cincinnati"],
        "Oklahoma": ["Oklahoma City", "Tulsa", "Norman"],
        "Oregon": ["Portland", "Salem", "Eugene"],
        "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown"],
        "Rhode Island": ["Providence", "Warwick", "Cranston"],
        "South Carolina": ["Charleston", "Columbia", "North Charleston"],
        "South Dakota": ["Sioux Falls", "Rapid City", "Aberdeen"],
        "Tennessee": ["Nashville", "Memphis", "Knoxville"],
        "Texas": ["Houston", "Austin", "Dallas"],
        "Utah": ["Salt Lake City", "West Valley City", "Provo"],
        "Vermont": ["Burlington", "South Burlington", "Rutland"],
        "Virginia": ["Virginia Beach", "Norfolk", "Chesapeake"],
        "Washington": ["Seattle", "Spokane", "Tacoma"],
        "West Virginia": ["Charleston", "Huntington", "Morgantown"],
        "Wisconsin": ["Milwaukee", "Madison", "Green Bay"],
        "Wyoming": ["Cheyenne", "Casper", "Laramie"],
    },
    "India": {
        "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur"],
        "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro"],
        "Assam": ["Guwahati", "Silchar", "Dibrugarh"],
        "Bihar": ["Patna", "Gaya", "Bhagalpur"],
        "Chhattisgarh": ["Raipur", "Bilaspur", "Durg"],
        "Goa": ["Panaji", "Margao", "Vasco da Gama"],
        "Gujarat": ["Ahmedabad", "Surat", "Vadodara"],
        "Haryana": ["Gurgaon", "Faridabad", "Panipat"],
        "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala"],
        "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad"],
        "Karnataka": ["Bangalore", "Mysore", "Hubli"],
        "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode"],
        "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior"],
        "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
        "Manipur": ["Imphal", "Churachandpur", "Thoubal"],
        "Meghalaya": ["Shillong", "Tura", "Jowai"],
        "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
        "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
        "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela"],
        "Punjab": ["Chandigarh", "Ludhiana", "Amritsar"],
        "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur"],
        "Sikkim": ["Gangtok", "Namchi", "Pelling"],
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
        "Telangana": ["Hyderabad", "Warangal", "Nizamabad"],
        "Tripura": ["Agartala", "Udaipur", "Dharmanagar"],
        "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi"],
        "Uttarakhand": ["Dehradun", "Haridwar", "Nainital"],
        "West Bengal": ["Kolkata", "Darjeeling", "Siliguri"],
        "Andaman and Nicobar Islands": ["Port Blair"],
        "Chandigarh": ["Chandigarh"],
        "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Silvassa"],
        "Delhi": ["New Delhi"],
        "Jammu and Kashmir": ["Srinagar", "Jammu"],
        "Ladakh": ["Leh", "Kargil"],
        "Lakshadweep": ["Kavaratti"],
        "Puducherry": ["Pondicherry", "Karaikal"],
    },
}

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
    if country in location_data:
        return list(location_data[country].keys())
    return ["Select a valid country"]

def update_cities(country, state):
    """Update the cities dropdown based on the selected country and state."""
    if isinstance(state, list):
        state = state[0]
    if country in location_data and state in location_data[country]:
        return location_data[country][state]
    return ["Select a valid state"]

# Define the Gradio interface
with gr.Blocks(title="Professional IT Resume Builder", description="Build your professional IT resume by providing your details below.") as interface:
    with gr.Row():
        name = gr.Textbox(label="Name", placeholder="Enter your full name")
        email = gr.Textbox(label="Email", placeholder="Enter your email address")
        mobile = gr.Textbox(label="Mobile Number", placeholder="Enter your mobile number")
    
    with gr.Row():
        country = gr.Dropdown(label="Country", choices=list(location_data.keys()), value="USA", interactive=True)
        state = gr.Dropdown(label="State", choices=[], interactive=True)
        city = gr.Dropdown(label="City", choices=[], interactive=True)
    
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