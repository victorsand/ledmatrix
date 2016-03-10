

### POST /addRecurringMessage
Adds a message to the queue. The queue will loop all messages in turn until they are removed.

#### Params:

##### message
*[Required]* Message to display. Max 512 characters, English charset.

##### messageColor
*[Required]* String with three RGB numbers, 0-7.

##### borderColor
*[Required]* String with three RGB numbers, 0-7.

#### Returns (JSON):
```
{
	id: [UUID of the added message, used to remove message from the queue later],
	recurringMessages: [Array with the recurring messages currently on the server],
	error: [Error message]
}
```

### POST /removeRecurringMessage
Removes a specific message from the queue.

#### Params:

##### id
*[Required]* Message to remove from queue.


### Returns (JSON):
```
{
	recurringMessages: [Array with the recurring messages currently on the server],
	error: [Error message]
}
```

### POST /showTemporaryMessage
Shows a one-time message, and then goes back to looping recurring messages.

#### Params:

##### message
*[Required]* Message to display. Max 512 characters, English charset.

##### messageColor
*[Required]* String with three RGB numbers, 0-7.

##### borderColor
*[Required]* String with three RGB numbers, 0-7.

#### Returns (JSON):
```
{
	error: [Error message]
}
```

### GET /recurringMessages
Returns a list of recurring messages.

#### Params:
(none)

### Returns (JSON):
```
{
	recurringMessages: [Array with the recurring messages currently on the server],
	error: [Error message]
}
```

### POST /clear
Removes all recurring messages.

#### Params:
(none)

### Returns (JSON):
```
{
	error: [Error message]
}
```


	
