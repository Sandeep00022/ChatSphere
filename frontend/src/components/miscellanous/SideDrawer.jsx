import {
  Avatar,
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuIcon,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatLoading from "./ChatLoading";
import UserList from "../userAvatar/UserList";
import { getSender } from "../../config/Chatlogics";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchresult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    baseUrl,
    user,
    chats,
    setChats,
    setSelectedChat,
    notification,
    setNotification,
  } = ChatState();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Plese Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: "true",
        position: "top",
      });
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `${baseUrl}/api/user?search=${search}`,
        config
      );
      console.log(data);
      if (data.length === 0) {
        toast({
          title: "user not exist",
          status: "warning",
          duration: 5000,
          isClosable: "true",
          position: "top",
        });
        setLoading(false);
        return;
      }
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Failed to Load the Search Result",
        status: "error",
        duration: 5000,
        isClosable: "true",
        position: "top",
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        `${baseUrl}/api/chat`,
        { userId },
        config
      );
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: "true",
        position: "top",
      });
    }
  };

  // console.log(searchresult);
  return (
    <>
      <Box
        bg="white"
        p="10px"
        borderWidth="5px"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Button onClick={onOpen} variant="ghost" mr="2">
          <i className="fas fa-search"></i>
          <Text d={{ base: "none", md: "flex" }} px="2" fontSize="sm">
            Search User
          </Text>
        </Button>
        <Text fontSize="lg" fontFamily="work sans">
          Sphere Chat
        </Text>
        <Menu>
          <MenuButton>
            <Badge
              colorScheme={notification.length > 0 ? "red" : "gray"}
              borderRadius="full"
              px="2"
              py="1"
              fontSize="sm"
            >
              <BellIcon fontSize="xl" />
              {notification.length > 0 && notification.length}
            </Badge>
          </MenuButton>
          <MenuList>
            {!notification.length && <MenuItem>No New Messages</MenuItem>}
            {notification.map((notif) => (
              <MenuItem
                key={notif._id}
                onClick={() => {
                  setSelectedChat(notif.chat);
                  // Filter out the clicked notification from the state
                  const updatedNotifications = notification.filter(
                    (fil) => fil !== notif
                  );
                  setNotification(updatedNotifications);

                  // Update local storage with the filtered notifications
                  localStorage.setItem(
                    "notifications",
                    JSON.stringify(updatedNotifications)
                  );
                }}
              >
                {notif.chat.isGroupChat
                  ? `New Message: ${notif.chat.chatName}`
                  : `New message from ${getSender(user, notif.chat.users)}`}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
        <Menu>
          <MenuButton>
            <Avatar
              size="sm"
              cursor="pointer"
              name={user.name}
              src={user.pic}
            />
          </MenuButton>
          <MenuList>
            <ProfileModal user={user}>
              <MenuItem>My Profile</MenuItem>
            </ProfileModal>
            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth={"1px"}>Search Users</DrawerHeader>
          <DrawerBody>
            <Box display={"flex"} pb={2}>
              <Input
                mr={"2"}
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchresult?.map((user) => (
                <UserList
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml={"auto"} display={"flex"} />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
