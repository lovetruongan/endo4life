import { VscChevronDown } from 'react-icons/vsc';
import { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { IMenuItem, UniqueId } from '@endo4life/types';
import { IconType } from 'react-icons';

interface Props {
  selectedIds: UniqueId[];
  menuItems: IMenuItem[];
  text: string;
  icon?: IconType;
}
export function EntityMenu({ text, icon, selectedIds, menuItems }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }
  const Icon = icon;

  if (selectedIds.length === 0) {
    return null;
  }
  return (
    <div className="relative flex-none">
      <button
        className="px-3 py-1.5 flex items-center gap-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-700 relative"
        onClick={handleClick}
      >
        {Icon && <Icon size={18} />}
        <span className="hidden px-1 text-sm font-medium md:block">{text}</span>
        <VscChevronDown size={16} />
      </button>

      <Menu
        id="entity-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'entity-menu' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
      >
        {menuItems.map((item) => {
          const ItemIcon = item.icon;
          return (
            <MenuItem
              key={item.id}
              onClick={() => {
                setAnchorEl(null);
                item.onClick && item.onClick();
              }}
            >
              {ItemIcon && (
                <ListItemIcon>
                  <ItemIcon size={18} className="text-slate-900" />
                </ListItemIcon>
              )}
              <ListItemText className="pr-4">{item.label}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
}

export default EntityMenu;
