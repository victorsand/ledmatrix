

## /addRecurringMessage
Adds a message to the queue. The queue will loop all messages in turn until they are removed.
### Params:
```
**message**: Message to display. Max 512 characters, English charset.
**messageColor**: String with three RGB numbers, 0-7. (700 is red, 070 green, 007 blue, 770 yellow et cetera).
**borderColor**: String with three RGB numbers, 0-7.
```
### Returns:
```
{
	id: [UUID of the message, used to remove message from the queue later],
	recurringMessages: [Array with the recurring messages currently on the server],
	error: [Error message]
}
```

## /removeRecurringMessage
Removes a specific message from the queue.
### Params:
```
**id**: UUID of the message to remove
```
### Returns:
```
{
	recurringMessages: [Array with the recurring messages currently on the server],
}
```
	
