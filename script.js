const socket =io();

socket.on('escalation_requested',({CallSid}) =>{
    document.getElementById('status').textContent = 'Escalation requested for CallSid: ${CallSid}';
    const accept = confirm('Accept escalation?');
    if(accept){
        socket.emit('escalation_accepted',{CallSid});

    }
});

socket.on('escalation_initiated',({CallSid})=>{
    document.getElementById('status').textContent = `Escalation initiated for CallSid: ${CallSid}`;
});