const express = require('express');
const http = require('http');
const socketIo=require('socket.io');
const bodyParser=require('bodyParser');
const {RTCPeerConnection,RTCSessionDescription}=require('wrtc');
const twilio = require('twilio');

const app=express();
const server=http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json);
app.use(bodyParser.urlencoded({extended: true}));

const callSessions = {};

app.post('/voice',(req,res) =>{
    const { CallSid, From} =req.body;
    callSessions[CallSid]={
        customerPhone: From,
        isEscalated:false,
    };


    const response =
        `<Response>
            <Connect action="/handle-escalation">
                <Stream url="wss://your-server.com/socket/${CallSid}" />
            </Connect>
        <Response>`;
    res.set('Content-Type','application/xml');
    res.send(response);
});

app.post('/handle-escalation',(req,res)=>{
    const {CallSid} =req.body;

    if(callSessions[CallSid] && !callSessions[CallSid].isEscalated){
        callSessions[CallSid].isEscalated =true;
        io.emit('escalation_requested',{CallSid});
    }

    res.send('Escalation Processed');
});

io.on('connection',(socket)=>{
    console.log('WebSocket connected');

    socket.on('escalation_accepted',async({CallSid}) =>{
        if(callSessions[CallSid]){
            const client =twilio('TWILIO_ACCOUNT_SID','TWILIO_AUTH_TOKEN');
                await client.calls.create({
                    url: 'https://demo.twilio.com/docs/voice.xml',
                    to: 'AGENT_PHONE_NUMBER',
                    from: 'TWILIO_PHONE_NUMBER',
                });
                io.emit('escalation_initiated',{CallSid});
        }    
        
    });
});

server.listen(5000,() => console.log('Server running on port 5000'));

