import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress for the preloader
import { format } from 'date-fns';
import Iconify from 'src/components/iconify';
import { Stack } from '@mui/system';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { TICKET_RESPONSE_ENDPOINT } from 'src/utils/apiEndPoints';
import { ManageAPIsData } from 'src/utils/commonFunction';

const ChatComponent = ({ userid, invoiceId, ResponseId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false); // State to track message sending animation
    const [loading, setLoading] = useState(true); // State to manage loading state
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchConversation = async () => {
            try {
                const apiUrl = `${TICKET_RESPONSE_ENDPOINT}?ticket_id=${invoiceId}`;
                const response = await ManageAPIsData(apiUrl, 'GET');
                if (!response.ok) {
                    console.error("Error fetching data:", response.statusText);
                    return;
                }
                const responseData = await response.json();
                if (responseData && Array.isArray(responseData.data)) {
                    const parsedMessages = responseData.data.map(msg => ({
                        text: msg.message,
                        sender: msg.response_from === userid ? 'You' : 'Support',
                        timestamp: new Date(msg.created_at),
                        isNote: msg.response_type === 2, // Check if the message is a note
                    }));
                    setMessages(parsedMessages.reverse());
                    setLoading(false); // Set loading to false when messages are loaded
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (userid && invoiceId) {
            fetchConversation();
        }
    }, [userid, invoiceId]);

    const handleSend = async () => {
        if (input.trim()) {
            try {
                setSending(true); // Start sending animation
                const apiUrl = TICKET_RESPONSE_ENDPOINT; // Replace with your API endpoint for sending messages
                const payload = {
                    ticket_id: invoiceId,
                    response_from: userid,
                    response_to: ResponseId, // Assuming response_to is fixed or you have another way of determining it
                    response_type: 1, // Assuming response_type for message is fixed
                    message: input.trim(),
                };
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
                if (!response.ok) {
                    console.error("Error sending message:", response.statusText);
                    return;
                }
            } catch (error) {
                console.error("Error sending message:", error);
            }
            setMessages([...messages, { text: input, sender: 'You', timestamp: new Date(), isNote: false }]);
            setInput(''); // Clear the input after sending the message
            setSending(false); // Stop sending animation
        }
    };

    const handleNote = async () => {
        if (input.trim()) {
            try {
                setSending(true); // Start sending animation
                const apiUrl = TICKET_RESPONSE_ENDPOINT; // Replace with your API endpoint for adding notes
                const payload = {
                    ticket_id: invoiceId,
                    response_from: userid,
                    response_to: ResponseId,
                    response_type: 2,
                    message: input.trim(),
                };
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
                if (!response.ok) {
                    console.error("Error adding note:", response.statusText);
                    return;
                }
            } catch (error) {
                console.error("Error adding note:", error);
            }
            const newMessage = { text: input, sender: 'You', timestamp: new Date(), isNote: true };
            setMessages([...messages, newMessage]);
            setInput(''); // Clear the input after adding the note
            setSending(false); // Stop sending animation
        }
    };

    return (
        <Card sx={{ p: 2, maxHeight: 600, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Chat</Typography>
            {loading ? ( // Render preloader if messages are not loaded
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Box sx={{ overflowY: 'auto', mb: 2, maxHeight: 800, flexGrow: 1 }}>
                        <List>
                            {messages.map((message, index) => (
                                <ListItem
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: message.sender === 'You' ? 'flex-end' : 'flex-start',
                                        textAlign: message.sender === 'You' ? 'right' : 'left',
                                        mb: 1,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            backgroundColor: message.isNote ? '#fff9c4' : (message.sender === 'You' ? '#dcf8c6' : '#fff'),
                                            borderRadius: 2,
                                            p: message.isNote ? 2 : 1.5,
                                            maxWidth: '70%',
                                            wordWrap: 'break-word',
                                            overflowWrap: 'break-word',
                                            boxShadow: 1,
                                            position: 'relative',
                                            animation: sending ? 'fade-in 0.5s ease-in-out' : 'none',
                                        }}
                                    >
                                        {message.isNote && (
                                            <Typography variant="subtitle2" sx={{ alignSelf: 'flex-start', color: 'black', textAlign: 'left', mb: 4 }}>
                                                Note:-
                                            </Typography>
                                        )}
                                        <ListItemText
                                            primary={message.text}
                                            sx={{ color: 'black', whiteSpace: 'pre-line', textAlign: 'left' }}
                                        />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: -7,
                                                left: message.sender === 'You' ? 'auto' : '8px',
                                                right: message.sender === 'You' ? '8px' : 'auto',
                                                border: '7px solid',
                                                borderColor: message.isNote ? (message.sender === 'You' ? '#dcf8c6' : '#fff9c4') : (message.sender === 'You' ? '#dcf8c6' : '#fff'),
                                                borderTopColor: 'transparent',
                                                borderLeftColor: message.sender === 'You' ? 'transparent' : '#fff',
                                                borderBottomColor: 'transparent',
                                                borderRightColor: message.sender === 'You' ? '#dcf8c6' : 'transparent',
                                                backgroundColor: 'transparent',
                                            }}
                                        />
                                    </Box>
                                    <ListItemText
                                        secondary={format(new Date(message.timestamp), "MMM dd, yyyy ha")}
                                        sx={{ color: 'gray', mt: 1, fontSize: '0.75rem', textAlign: message.sender === 'You' ? 'right' : 'left' }}
                                    />
                                </ListItem>
                            ))}
                            <div ref={messagesEndRef} />
                        </List>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', transition: 'all 0.3s ease-in-out' }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message or note here"
                            sx={{
                                flex: 1,
                                borderRadius: '20px',
                                mr: 1,
                                textAlign: 'left', // Align input text to left
                            }}
                        />
                        <Stack direction="column" alignItems="center" sx={{ mt: 1, mr: 1 }}>
                            <Button
                                disabled={sending}
                                onClick={handleSend}
                                variant="contained"
                                sx={{
                                    minWidth: '40px',
                                    borderRadius: '20px',
                                    backgroundColor: '#4caf50',
                                    color: 'white', '&': { backgroundColor: '#388e3c' },
                                    opacity: sending ? 0.5 : 1,
                                }}
                            >
                                <Iconify icon='mingcute:send-fill' />
                            </Button>
                            <Typography variant="caption" align="center">Send</Typography>
                        </Stack>
                        <Stack direction="column" alignItems="center" sx={{ mt: 1 }}>
                            <Button
                                disabled={sending}
                                onClick={handleNote}
                                variant="contained"
                                sx={{
                                    minWidth: '40px',
                                    borderRadius: '20px',
                                    backgroundColor: '#ff9800',
                                    color: 'white', '&': {
                                        backgroundColor: '#f57c00',
                                    },
                                    opacity: sending ? 0.5 : 1,
                                }}
                            >
                                <Iconify icon='material-symbols-light:note-sharp' />
                            </Button>
                            <Typography variant="caption" align="center">Note</Typography>
                        </Stack>
                    </Box>
                </>
            )
            }
        </Card >
    );
};

ChatComponent.propTypes = {
    userid: PropTypes.string.isRequired,
    invoiceId: PropTypes.string.isRequired,
};

export default ChatComponent;
