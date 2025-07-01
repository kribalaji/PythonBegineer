import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from "@mui/material";
import axios from "axios";

function UpdateResumeDialog({ open, onClose, onResumeLoaded }) {
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  const handleFetch = async () => {
    setError("");
    try {
      const res = await axios.get(`/api/resume/${mobile}`);
      if (res.data && res.data.resumeData) {
        onResumeLoaded(res.data.resumeData, mobile);
        onClose();
      } else {
        setError("No resume found for this mobile number.");
      }
    } catch (err) {
      setError("No resume found for this mobile number.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Update Resume</DialogTitle>
      <DialogContent>
        <TextField
          label="Enter your mobile number"
          value={mobile}
          onChange={e => setMobile(e.target.value)}
          fullWidth
          margin="normal"
        />
        {error && <Typography color="error">{error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleFetch} disabled={!mobile}>Fetch Resume</Button>
      </DialogActions>
    </Dialog>
  );
}

export default UpdateResumeDialog;