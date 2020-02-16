# Holiday Extras

## Technical Challenge

## Jamie Hill

## February 2020

### **Challenge Selected**

Challenge taken from https://github.com/holidayextras/recruitment-tasks/blob/master/developer-API-task.md

Opting for a full stack implementation using MongoDB for the database with an Express api providing access to a React front end.

### **Run the application**

To run the application, everything will be built via dockerfiles, simply run this command in this directory:

`docker-compose up`

It may require that the docker images are built.

`docker-compose up --build`

### **Exit the application**

To exit the application you can do a ctrl-c on the terminal that is running the application. It's worth doing docker-compose down to ensure everything has been cleaned up afterwords.

`ctrl-c`

`docker-compose down`

### **Notes**

1. For the purposes of this technical challenge, so its quick and easy to run this project, I've commited my `.env` file to the repository, normally I would not do this.
2. I've left `id` in the user data structure, although Mongo creates a `_id` for each entry. `id` is required?
