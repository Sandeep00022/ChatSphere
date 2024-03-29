import React from 'react'
import { ChatState } from '../../context/ChatProvider'
import { Avatar, Box, Text } from '@chakra-ui/react'

const UserList = ({user,handleFunction}) => {

  return (
    <Box
    borderRadius={"10px"}
    marginBottom={"5px"}
    onClick={handleFunction}
    cursor={"pointer"}
    bg="#E8E8E8"
    p="5px 10px 5px 10px"
     _hover={{
        background: "#38B2AC",
        color: "white",
     }}
     w="100%"
     display="flex"
     alignItems="center"
     color ="black"
     px={3}
     py={2}
    >
     <Avatar
     mr={2}
     size="sm"
     cursor="pointer"
     name={user.name}
     src={user.pic}
     />
     <Box>
        <Text>{user.name}</Text>
        <Text fontSize="xs" >
            <b>Email : </b>
            {user.email}
        </Text>
     </Box>
    </Box>
  )
}

export default UserList
