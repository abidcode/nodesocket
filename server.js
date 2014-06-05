var mongo = require('mongodb').MongoClient,
	Client = require('socket.io').listen(80).sockets;
	mongo.connect('mongodb://http://nodejs-androidabid.rhcloud.com/chat',function(err, db){
			if(err) throw err;
			Client.on('connection',function(socket){
					//get mongo db collection
					console.log("Connected to server");
					var col = db.collection("messages"),
					sendStatus = function(s){
							socket.emit('status',s);
						};
					//emit all messages
					col.find().limit(100).sort({_id:1}).toArray(function(err, res){
							if(err) throw err;
							socket.emit("output",res);
						});	
					
					//wait for input
					socket.on('input',function(data){
							console.log("data------->"+data);
							//insert into mongodb server
							//json data from client
							var name = data.name,
								message = data.message,
								whitespacePattern = /^\s*$/;
								if(whitespacePattern.test(name) || whitespacePattern.test(message)){
									sendStatus("Name and Message is required.");
									console.log("invalid data");
								}else{
									  col.insert({name: name,message:message},function(){
										  //emit latest to all clients 
										  Client.emit('output',[data]);
										sendStatus({
												message:"message sent",
												clear:true
											});
									  });											 
									}
						//on input
						});
				//on connection
				});
		//mongo db connect
		});
	