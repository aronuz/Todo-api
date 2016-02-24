var bcrypt = require('bcryptjs');
var _=require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports=function(sequelize, DataTypes){
	var user = sequelize.define('user', {
	 	email:{
			type:DataTypes.STRING,
		 	allowNull:false,
		 	unique:true,
		 	validate:{
				isEmail:true 
			}
		},
		salt:{
			type: DataTypes.STRING,
		},
		password_hash:{
			type: DataTypes.STRING,
		},
		password:{
			type:DataTypes.VIRTUAL,
			allowNull:false,
			validate:{
				len:[7,100]
			},
			set: function(value){
			 	var salt=bcrypt.genSaltSync(10);
			 	var hashedPassword= bcrypt.hashSync(value, salt);
			 	
			   this.setDataValue('password', value);
				 this.setDataValue('salt', salt);
				 this.setDataValue('password_hash', hashedPassword);	
			}
		} 
	},
	{
		hooks:{
			beforeValidate: function(user, oprions){
				if(typeof user.email==='string'){
					user.email=user.email.toLowerCase();
				}
			}
		},
		classMethods:{
			authenticate: function(body){
				return new Promise(function(resolve, reject){
				 	if(typeof body.email !== 'string' || typeof body.password !== 'string'){
				 		return reject(); 
				 	}
				   
				    user.findOne({
				 		where: {
				 			email: body.email
				 		}                 
				 	}).then(function(user){
				 		if(!user || !bcrypt.compareSync(body.password, user.get('password_hash'))){
				 			return reject();
				 		}
				 		resolve(user);
				 	}, function(e){
				 		reject();
				 	});
				});	
			},
			findByToken:function(token){
			  console.log('token '+token);
				return new Promise(function (resolve, reject){
					try{
						var decodedJWT=jwt.verify(token, 'qwerty098'); 
					  console.log('decodedJWT.token '+decodedJWT.token);
						var bytes=cryptojs.AES.decrypt(decodedJWT.token, 'abc123!@#!');
						var tokenData=JSON.parse(bytes.toString(cryptojs.enc.Utf8)); 
											 
						user.findById(tokenData.id).then(function(user){
							if(user){
								resolve(user);
							}else{
								reject();
							}
						}, function(e){
						 	reject();
						});
					}
					catch(e){console.error(e);reject();}		
				});
			}
		},
		instanceMethods: {
			toPublicJSON:function(){
				var json=this.toJSON();
				return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
			},
			generateToken:function(type){
				if(!_.isString(type)){
					return undefined;
				}
				try{ console.log('type '+type);
					var stringData=JSON.stringify({id:this.get('id'),type:type});
					console.log('stringData '+stringData);
					var encryptData=cryptojs.AES.encrypt(stringData, 'abc123!@#!').toString;
					var token=jwt.sign({
						token:encryptData
					}, 'qwerty098');
					return token;
				}
				catch(e){return undefined();}
			}                             			
		}
	});
	
	return user;
};