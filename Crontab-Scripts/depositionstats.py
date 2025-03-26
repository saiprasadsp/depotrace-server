# Python version: 3.4+

import mysql.connector
import pymongo
import datetime
import enum
import urllib
from pymongo import MongoClient


class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


class MsgType(enum.Enum):
    HEADER = 1
    OKBLUE = 2
    OKCYAN = 3
    OKGREEN = 4
    WARNING = 5
    FAIL = 6
    ENDC = 7
    BOLD = 8
    UNDERLINE = 9

# Pretty Print Function


def prettyprint(msg_text, msg_type):
    if msg_type == MsgType.HEADER:
        print(f"{bcolors.HEADER}{msg_text}{bcolors.ENDC}")
    elif msg_type == MsgType.OKBLUE:
        print(f"{bcolors.OKBLUE}{msg_text}{bcolors.ENDC}")
    elif msg_type == MsgType.OKCYAN:
        print(f"{bcolors.OKCYAN}{msg_text}{bcolors.ENDC}")
    elif msg_type == MsgType.OKGREEN:
        print(f"{bcolors.OKGREEN}{msg_text}{bcolors.ENDC}")
    elif msg_type == MsgType.WARNING:
        print(f"{bcolors.WARNING}{msg_text}{bcolors.ENDC}")
    elif msg_type == MsgType.FAIL:
        print(f"{bcolors.FAIL}{msg_text}{bcolors.ENDC}")
    elif msg_type == MsgType.BOLD:
        print(f"{bcolors.BOLD}{msg_text}{bcolors.ENDC}")
    elif msg_type == MsgType.UNDERLINE:
        print(f"{bcolors.UNDERLINE}{msg_text}{bcolors.ENDC}")

# Function migrate_table


def migrate_table(db, table_name):
    # TODO: Sanitize table name to conform to MongoDB Collection naming restrictions
    # For example, the $ sign is allowed in MySQL table names but not in MongoDB Collection names
    mycursor = db.cursor(dictionary=True)
    mycursor.execute("SELECT * FROM " + table_name + ";")
    myresult = mycursor.fetchall()

    mycol = mydb[table_name]

    if delete_existing_documents:
        # delete all documents in the collection
        mycol.delete_many({})

    # insert the documents
    if len(myresult) > 0:
        x = mycol.insert_many(myresult)
        return len(x.inserted_ids)
    else:
        return 0


begin_time = datetime.datetime.now()
abort = False
prettyprint(f"Script started at: {begin_time}", MsgType.HEADER)

delete_existing_documents = False
# mysql_host="localhost"
# mysql_database="depotrace"
# mysql_schema = "depotrace"
# mysql_user="root"
# mysql_password="sysadmin"

mysql_host = "ed-sandboxdb.cd2jroqwwfdt.us-east-1.rds.amazonaws.com"
mysql_database = "ed_sandboxdb"
mysql_schema = "ed_sandboxdb"
mysql_user = "root"
mysql_password = "S4ndb0x!"

# mongodb_host = "mongodb://localhost:27017/"
# mongodb_host = "mongodb://143.110.180.212:27017/"
mongodb_host = "mongodb://34.93.179.78:27017/"
# mongodb_dbname = "fullstack"
# mongodb_dbname = "dev_depotrace_db"
# mongodb_dbname = "depotrace_db"

MONGO_HOST = "34.93.179.78"
MONGO_PORT = "27017"
MONGO_USER = "appprod_dbadmin"
MONGO_PASS = "appPr0dD3poTrac3"
mongodb_dbname = "depotrace_db"
uri = "mongodb://{}:{}@{}:{}/?authSource=admin".format(urllib.parse.quote_plus(
    MONGO_USER), urllib.parse.quote_plus(MONGO_PASS), MONGO_HOST, MONGO_PORT)

client = MongoClient(uri)
print(client)
mydatabase = client[mongodb_dbname]
collection = mydatabase['depositionstats']
collection.drop()
prettyprint("Connecting to MySQL server...", MsgType.HEADER)
mysqldb = mysql.connector.connect(
    host=mysql_host,
    database=mysql_database,
    user=mysql_user,
    password=mysql_password
)
prettyprint("Connection to MySQL Server succeeded.", MsgType.OKGREEN)

# MongoDB connection
prettyprint("Connecting to MongoDB server...", MsgType.HEADER)
myclient = pymongo.MongoClient(uri)
mydb = myclient[mongodb_dbname]
mycol = mydb["depositionstats"]
prettyprint("Connection to MongoDB Server succeeded.", MsgType.OKGREEN)

# Start migration
prettyprint("Migration started...", MsgType.HEADER)

mycursor = mysqldb.cursor(dictionary=True)

# depositionQuery = "select d.ID, d.depositionOf, d.statusID, d.class as classType, d.meeting_required, da.ID as attendeeID,da.userID,da.role, da.name,da.email as attendeeEmail,u.email as memberEmail,u.clientID,das.userID as isAssistant,cm.userID as isManager,(u.ID=d.createdBy) AS isOwner, d.started, d.finished from DepositionAttendees da left join Users u on u.ID=da.userID left join DepositionAssistants das on da.userID=das.userID AND das.depositionID=da.depositionID inner join Depositions d on d.ID=da.depositionID left join CaseManagers cm on cm.userID=da.userID AND cm.caseID=d.caseID where da.depositionID IN (SELECT ID FROM ed_sandboxdb.Depositions where started between '2000-01-01 00:00:00' and '2023-04-04 23:59:00')"

# depositionQuery = "select d.ID, d.depositionOf,d.class as classType, d.meeting_required,d.created ,d.createdBy AS isOwner, d.started, d.finished,(CASE WHEN d.statusID = 'F' THEN 'Finshed'WHEN d.statusID = 'I' THEN 'InProgress' WHEN d.statusID = 'N'THEN 'Scheduled' ELSE 'NOTFOUND' END) AS statusID from  Depositions d ORDER BY created desc;"

depositionQuery = "select d.ID, d.depositionOf,d.class as classType, d.meeting_required,d.created ,d.createdBy AS isOwner, d.started,da.role, d.finished,(CASE WHEN d.statusID = 'F' THEN 'Finished'WHEN d.statusID = 'I' THEN 'InProgress' WHEN d.statusID = 'N'THEN 'Scheduled' ELSE 'NOTFOUND' END) AS statusID, COUNT(CASE WHEN role = 'M' THEN 1 END) AS Members, COUNT(CASE WHEN role = 'W' THEN 1 END) AS Witness,COUNT(CASE WHEN role = 'TW' THEN 1 END) AS TemporaryWitness,COUNT(CASE WHEN role = 'WM' THEN 1 END) AS WitnessMember, COUNT(CASE WHEN role = 'G' THEN 1 END) AS Guest, COUNT(da.ID) AS totalUsers from  Depositions d INNER JOIN DepositionAttendees AS da ON d.ID = da.depositionID GROUP BY depositionID order by depositionID desc;"

mycursor.execute(depositionQuery)
myresult = mycursor.fetchall()


if len(myresult) > 0:
    x = mycol.insert_many(myresult)  # myresult comes from mysql cursor
    print(len(x.inserted_ids))
