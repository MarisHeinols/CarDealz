// src/components/admin/store/AdminSidebar.tsx
import {
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import type { StoreAdminSection } from "~/types/types";

const sections: { id: StoreAdminSection; label: string }[] = [
  { id: "appearance", label: "Appearance" },
  { id: "branding", label: "Branding" },
  { id: "info", label: "Store Info" },
  { id: "location", label: "Location" },
];

interface Props {
  selected: StoreAdminSection;
  onSelect: (s: StoreAdminSection) => void;
}

const AdminSidebar = ({ selected, onSelect }: Props) => {
  return (
    <List
      subheader={<ListSubheader>Store Settings</ListSubheader>}
      sx={{ pt: 0 }}
    >
      {sections.map((s) => (
        <ListItemButton
          key={s.id}
          selected={selected === s.id}
          onClick={() => onSelect(s.id)}
        >
          <ListItemText primary={s.label} />
        </ListItemButton>
      ))}
    </List>
  );
};

export default AdminSidebar;
