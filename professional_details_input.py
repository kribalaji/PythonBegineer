import gradio as gr

# Updated data for countries, states, and cities
location_data = {
    "USA": {
        "California": ["Los Angeles", "San Francisco", "San Diego"],
        "Texas": ["Houston", "Austin", "Dallas"],
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
    },
}

def collect_details(name, email, mobile, country, state, city, photo, projects):
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
        details += "**Photo Uploaded Successfully**\n\n"
    else:
        details += "**No Photo Uploaded**\n\n"

    for i, project in enumerate(projects):
        details += f"""
        **Project {i + 1}**:
        - **Name**: {project['project_name']}
        - **Description**: {project['project_description']}
        - **Tools Used**: {project['tools_used']}
        - **Roles**: {project['roles']}
        """
    return details

def update_states(country):
    """Update the states dropdown based on the selected country."""
    if country in location_data:
        return list(location_data[country].keys())
    return []

def update_cities(country, state):
    """Update the cities dropdown based on the selected country and state."""
    if country in location_data and state in location_data[country]:
        return location_data[country][state]
    return []

# Define the Gradio interface
with gr.Blocks() as interface:
    with gr.Row():
        name = gr.Textbox(label="Name", placeholder="Enter your full name", required=True)
        email = gr.Textbox(label="Email", placeholder="Enter your email address", required=True)
        mobile = gr.Textbox(label="Mobile Number", placeholder="Enter your mobile number", required=True)
    
    with gr.Row():
        country = gr.Dropdown(label="Country", choices=list(location_data.keys()), value="USA", interactive=True)
        state = gr.Dropdown(label="State", choices=[], interactive=True)
        city = gr.Dropdown(label="City", choices=[], interactive=True)
    
    country.change(update_states, inputs=country, outputs=state)
    state.change(update_cities, inputs=[country, state], outputs=city)

    photo = gr.Image(label="Upload Photo", type="file", optional=True)

    projects = gr.Dataset(
        label="Projects",
        components=[
            gr.Textbox(label="Project Name", placeholder="Enter the project name"),
            gr.Textbox(label="Project Description", placeholder="Describe the project", lines=5),
            gr.Textbox(label="Tools Used", placeholder="List the tools/technologies used (comma-separated)"),
            gr.Textbox(label="Roles in Project", placeholder="Describe your roles in the project", lines=3),
        ],
        default=0,
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