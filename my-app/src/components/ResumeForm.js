import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, MenuItem, Button, Box, Typography } from "@mui/material";

const locationData = {
  USA: {
    California: ["Los Angeles", "San Francisco", "San Diego"],
    Texas: ["Houston", "Austin", "Dallas"],
  },
  India: {
    Karnataka: ["Bangalore", "Mysore", "Hubli"],
    TamilNadu: ["Chennai", "Coimbatore", "Madurai"],
  },
};

function ResumeForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    mobileNumber: "",
    country: "",
    state: "",
    city: "",
    practice: "", // Added practice field
  });

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [errors, setErrors] = useState({
    mobileNumber: "",
    firstName: "",
    lastName: "",
  });

  const navigate = useNavigate(); // Hook for navigation

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validate string fields
    if (["firstName", "middleName", "lastName", "city"].includes(name)) {
      const stringRegex = /^[a-zA-Z\s]*$/; // Allow only letters and spaces
      if (!stringRegex.test(value)) {
        setErrors({ ...errors, [name]: `${name} must contain only letters` });
      } else {
        setErrors({ ...errors, [name]: "" });
      }
    }

    // Validate mobile number (integer field)
    if (name === "mobileNumber") {
      const mobileRegex = /^[0-9]{10}$/; // Allow exactly 10 digits
      if (!mobileRegex.test(value)) {
        setErrors({ ...errors, mobileNumber: "Mobile number must be 10 digits" });
      } else {
        setErrors({ ...errors, mobileNumber: "" });
      }
    }

    // Update states when a country is selected
    if (name === "country") {
      setStates(Object.keys(locationData[value] || {})); // Update states based on selected country
      setCities([]); // Reset cities when the country changes
      setFormData({ ...formData, country: value, state: "", city: "" });
    }

    // Update cities when a state is selected
    if (name === "state") {
      setCities(locationData[formData.country]?.[value] || []); // Update cities based on selected state
      setFormData({ ...formData, state: value, city: "" });
    }

    // Update formData state
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = () => {
    // Pass all relevant form data to the next step
    navigate("/build-my-resume/experience-summary", { 
      state: { resumeFormData: formData } 
    });
  };

  // Check if the form is valid
  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.mobileNumber &&
    formData.country &&
    formData.state &&
    formData.city &&
    formData.practice && // Added practice validation
    formData.suffix &&   // Ensure suffix is checked for validity
    !errors.firstName &&
    !errors.lastName &&
    !errors.mobileNumber;

  return (
    <Box
      component="form"
      sx={{
        maxWidth: 800, // Reduced width of the form
        margin: "0 auto",
        padding: 3,
        backgroundColor: "#f9f9f9",
        borderRadius: 2,
        boxShadow: 3,
        textAlign: "left", // Ensure left alignment
      }}
    >
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ color: "#333" }} // Set text color to dark gray
      >
        Associate Details
      </Typography>
      <TextField
        label="First Name"
        name="firstName"
        value={formData.firstName}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        required
        error={!!errors.firstName}
        helperText={errors.firstName}
        sx={{
          fontSize: "14px",
          backgroundColor: "#f5f5f5", // Light gray background color
          borderRadius: "5px", // Slightly rounded corners
          textAlign: "left", // Left-align text
        }}
      />
      <TextField
        label="Middle Name"
        name="middleName"
        value={formData.middleName}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        error={!!errors.middleName}
        helperText={errors.middleName}
        sx={{
          fontSize: "14px",
          backgroundColor: "#f5f5f5", // Light gray background color
          borderRadius: "5px", // Slightly rounded corners
          textAlign: "left", // Left-align text
        }}
      />
      <TextField
        label="Last Name"
        name="lastName"
        value={formData.lastName}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        required
        error={!!errors.lastName}
        helperText={errors.lastName}
        sx={{
          fontSize: "14px",
          backgroundColor: "#f5f5f5", // Light gray background color
          borderRadius: "5px", // Slightly rounded corners
          textAlign: "left", // Left-align text
        }}
      />
      <TextField
        label="Mobile Number"
        name="mobileNumber"
        value={formData.mobileNumber}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        required
        type="tel"
        error={!!errors.mobileNumber}
        helperText={errors.mobileNumber}
        sx={{
          fontSize: "14px",
          backgroundColor: "#f5f5f5", // Light gray background color
          borderRadius: "5px", // Slightly rounded corners
          textAlign: "left", // Left-align text
        }}
      />
      <TextField
        select
        label="Suffix"
        name="suffix"
        value={formData.suffix}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        required
        sx={{
          fontSize: "14px",
          backgroundColor: "#f5f5f5", // Light gray background color
          borderRadius: "5px", // Slightly rounded corners
          textAlign: "left", // Left-align text
        }}
      >
        <MenuItem value="Mr">Mr</MenuItem>
        <MenuItem value="Miss">Miss</MenuItem>
        <MenuItem value="Mrs">Mrs</MenuItem>
      </TextField>
      <TextField
        select
        label="Country"
        name="country"
        value={formData.country}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        required
        sx={{
          fontSize: "14px",
          backgroundColor: "#f5f5f5", // Light gray background color
          borderRadius: "5px", // Slightly rounded corners
          textAlign: "left", // Left-align text
        }}
      >
        {Object.keys(locationData).map((country) => (
          <MenuItem key={country} value={country}>
            {country}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="State"
        name="state"
        value={formData.state}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        disabled={!states.length}
        required
        sx={{
          fontSize: "14px",
          backgroundColor: "#f5f5f5", // Light gray background color
          borderRadius: "5px", // Slightly rounded corners
          textAlign: "left", // Left-align text
        }}
      >
        {states.map((state) => (
          <MenuItem key={state} value={state}>
            {state}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="City"
        name="city"
        value={formData.city}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        disabled={!cities.length}
        required
        error={!!errors.city}
        helperText={errors.city}
        sx={{
          fontSize: "14px",
          backgroundColor: "#f5f5f5", // Light gray background color
          borderRadius: "5px", // Slightly rounded corners
          textAlign: "left", // Left-align text
        }}
      >
        {cities.map((city) => (
          <MenuItem key={city} value={city}>
            {city}
          </MenuItem>
        ))}
      </TextField>
      
      {/* Practice dropdown field */}
      <TextField
        select
        label="Practice"
        name="practice"
        value={formData.practice}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        required
        sx={{
          fontSize: "14px",
          backgroundColor: "#f5f5f5", // Light gray background color
          borderRadius: "5px", // Slightly rounded corners
          textAlign: "left", // Left-align text
        }}
      >
        <MenuItem value="Horizontal">Horizontal</MenuItem>
        <MenuItem value="Vertical">Vertical</MenuItem>
      </TextField>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ marginTop: 2 }}
        onClick={handleNext} // Navigate to the next page
        disabled={!isFormValid} // Disable button if form is invalid
      >
        Next Page → Experience Summary
      </Button>
    </Box>
  );
}

export default ResumeForm;
