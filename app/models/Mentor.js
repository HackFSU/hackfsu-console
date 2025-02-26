/**
* Mentor model
*
*/

'use strict';

import _ from 'lodash';
import Parse from 'parse/node';
import validate from 'lib/validate';
import User from 'app/models/User';

const PARSE_CLASSNAME = 'Mentor';

export default class Mentor extends Parse.Object {
	constructor(o) {
		super(PARSE_CLASSNAME);
	}

	static new(o) {
		let mentor = new Mentor();
		o = validate(o, _.isObject);

		// These are the attributes that are stored in the user account
		let userData = _.pick(o,
			'email',
			'firstName',
			'lastName',
			'password',
			'shirtSize',
			'github',
			'phone',
			'diet'
		);

		let user = User.new(userData);

		// Mentor attributes
		mentor.set('affiliation', validate(o.affiliation, _.isString));
		mentor.set('firstHackathon', validate(o.firstHackathon, _.isBoolean));
		mentor.set('skills', validate(o.skills, _.isString));
		mentor.set('comments', validate(o.comments, _.isString));
		mentor.set('times', validate(o.times, function(times) {
			return _.isArray(times) || times === undefined;
		}));
		mentor.set('mlhcoc', validate(o.mlhcoc, _.isBoolean));
		mentor.set('user', user);

		return mentor;
	}

	static newWithUser(o) {
		let mentor = new Mentor();
		o = validate(o, _.isObject);

		// These are the attributes that are stored in the user accoun

		// Make user instance from id
		let user = new User();
		user.id = validate(o.userId, _.isString);
		user.set('objectId', user.id);

		// Mentor attributes
		mentor.set('affiliation', validate(o.affiliation, _.isString));
		mentor.set('firstHackathon', validate(o.firstHackathon, _.isBoolean));
		mentor.set('skills', validate(o.skills, _.isString));
		mentor.set('comments', validate(o.comments, _.isString));
		mentor.set('times', validate(o.times, function(times) {
			return _.isArray(times) || times === undefined;
		}));
		mentor.set('mlhcoc', validate(o.mlhcoc, _.isBoolean));
		mentor.set('user', user);

		return mentor;
	}

	/**
	* Returns a single Mentor based on ID
	*/
	static find(id) {
		let promiseFind = new Parse.Promise();

		let query = new Parse.Query(Mentor);
		query.get(id).then(function(mentor) {
			promiseFind.resolve(mentor);
		}, function(err) {
			promiseFind.reject(err);
		});

		return promiseFind;
	}

	/**
	* Finds a Mentor by the associated user
	*/
	static findByUser(uid) {
		let promiseFind = new Parse.Promise();

		User.find(uid)
		.then(function(user) {
			console.log(user);
			let query = new Parse.Query(Mentor);
			query.equalTo('user', user);
			query.include('user');
			return query.first();
		})
		.then(function(mentor) {
			promiseFind.resolve(mentor);
		}, function(err) {
			promiseFind.reject(err);
		});

		return promiseFind;
	}

	/**
	* The main signUp function for saving a Mentor. Use this instead of
	* mentor.save()! This does extra work required to save a mentor, i.e.,
	* creating the associated User account (for future
	* login stuff).
	*
	* Returns: a promise.
	* 	On success, the newly created Parse mentor object.
	*		On error, the error.
	*/
	signUp() {
		let promiseSignUp = new Parse.Promise();

		this.get('user').signUp().then((user) => {
			return this.save();
		})
		.then((mentor) => {
			//console.log('Mentor created: ', mentor);
			promiseSignUp.resolve(mentor);
		}, (err) => {
			//console.log('Error creating mentor: ', err);
			promiseSignUp.reject(err);
		});

		return promiseSignUp;
	}
}


Parse.Object.registerSubclass(PARSE_CLASSNAME, Mentor);
