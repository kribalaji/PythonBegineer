import { Card, Typography, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

function AppInfoCard() {
  return (
    <Card sx={{ mb: 4, p: 3, backgroundColor: "#e3f2fd", border: "1px solid #90caf9" }}>
      <Typography variant="h6" sx={{ color: "#1976d2", fontWeight: "bold", mb: 2 }}>
        Welcome to the Associate Data Center Resume Builder!
      </Typography>
      <List dense>
        <ListItem>
          <ListItemIcon><InfoOutlinedIcon color="primary" /></ListItemIcon>
          <ListItemText primary="Build your resume by entering your experience, projects, and skills." />
        </ListItem>
        <ListItem>
          <ListItemIcon><InfoOutlinedIcon color="primary" /></ListItemIcon>
          <ListItemText primary="Use 'Smart Generate' to auto-fill project descriptions and roles." />
        </ListItem>
        <ListItem>
          <ListItemIcon><InfoOutlinedIcon color="primary" /></ListItemIcon>
          <ListItemText primary="Download your resume as PDF or DOCX, or save it for future updates." />
        </ListItem>
        <ListItem>
          <ListItemIcon><InfoOutlinedIcon color="primary" /></ListItemIcon>
          <ListItemText primary="Update your resume anytime using your mobile number." />
        </ListItem>
        <ListItem>
          <ListItemIcon><InfoOutlinedIcon color="primary" /></ListItemIcon>
          <ListItemText primary="Explore IT Maps and Tech Skills Reports for more insights." />
        </ListItem>
      </List>
      <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
        Tip: Your resume is securely stored using your mobile number as a key. You can update and download it anytime!
      </Typography>
    </Card>
  );
}

export default AppInfoCard;