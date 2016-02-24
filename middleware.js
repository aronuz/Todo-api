module.exports=function(db){
	return{
		requireAuthentication: function(req, res, next){
			var token=req.get('Auth');
			console.log('token in middleware '+token);
			db.user.findByToken(token).then(function(user){
			console.log('user '+user);
				req.user=user;
				console.log('user');
				next();	
			}, function(){        
				res.status(401).send();
			});
		}
	};
};