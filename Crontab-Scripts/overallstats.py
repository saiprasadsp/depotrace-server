# Python version: 3.4+

import mysql.connector
import pymongo
import datetime
import enum
import json
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


def sum_sessions(sessionCount):
    total = 0
    for number in sessionCount:
        total += number
    return total


begin_time = datetime.datetime.now()
abort = False
prettyprint(f"Script started at: {begin_time}", MsgType.HEADER)

OverallDepositionStatSchema = {
    "totalSessions": "Number",
    "totalUsers": "Number",
    "totalCases": "Number",
    "yearlyData": [],
    "monthlyData": [],
    "dailyData": [],
    "casesData": [],
    "sessionsCountByCategory": []
}

delete_existing_documents = True
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
mongodb_host = "mongodb://34.93.179.78:27017/"
# mongodb_dbname = "fullstack"

# mongodb_dbname = "dev_depotrace_db"
MONGO_HOST = "34.93.179.78"
MONGO_PORT = "27017"
MONGO_USER = "appprod_dbadmin"
MONGO_PASS = "appPr0dD3poTrac3"
mongodb_dbname = "depotrace_db"

uri = "mongodb://{}:{}@{}:{}/?authSource=admin".format(urllib.parse.quote_plus(
    MONGO_USER), urllib.parse.quote_plus(MONGO_PASS), MONGO_HOST, MONGO_PORT)
client = MongoClient(uri)
prettyprint("Connection to MongoDB Server succeeded.", MsgType.OKGREEN)
mydatabase = client[mongodb_dbname]
collection = mydatabase['overallstats']
print("step 3", collection)
collection.drop()

# MySQL connection
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
mycol = mydb["overallstats"]
prettyprint("Connection to MongoDB Server succeeded.", MsgType.OKGREEN)

# Start migration
prettyprint("Migration started...", MsgType.HEADER)

sql0 = "select d.ID,count( d.depositionOf) as totalSessions,d.class as classType, d.meeting_required,d.created ,d.createdBy AS isOwner, d.started, d.finished,(CASE WHEN d.statusID = 'F' THEN 'Finished'WHEN d.statusID = 'I' THEN 'InProgress' WHEN d.statusID = 'N'THEN 'Scheduled' ELSE 'NOTFOUND' END) AS statusID from  Depositions d ORDER BY created desc;"

sql1 = "select count(distinct(d.ID)) as totalSessions, COUNT(da.ID) AS totalUsers, monthname(started) AS month, EXTRACT(YEAR FROM started) AS year from DepositionAttendees da left join Users u on u.ID=da.userID left join DepositionAssistants das on da.userID=das.userID AND das.depositionID=da.depositionID inner join Depositions d on d.ID=da.depositionID left join CaseManagers cm on cm.userID=da.userID AND cm.caseID=d.caseID where da.depositionID IN (SELECT ID FROM ed_sandboxdb.Depositions) GROUP BY month , year ORDER BY year asc, STR_TO_DATE(month, '%M');"

sql2 = "select count(distinct(d.ID)) as totalSessions, COUNT(da.ID) AS totalUsers, DATE_FORMAT(started,'%Y-%m-%d') AS date, monthname(started) AS month, EXTRACT(YEAR FROM started) AS year from DepositionAttendees da left join Users u on u.ID=da.userID left join DepositionAssistants das on da.userID=das.userID AND das.depositionID=da.depositionID inner join Depositions d on d.ID=da.depositionID left join CaseManagers cm on cm.userID=da.userID AND cm.caseID=d.caseID where da.depositionID IN (SELECT ID FROM ed_sandboxdb.Depositions) GROUP BY year, month, date ORDER BY year asc, month asc, date asc"

sql3 = "SELECT class as sessionsCategory, COUNT(class) as sessionsCategoryCount FROM ed_sandboxdb.Depositions GROUP BY class order by sessionsCategoryCount desc"

sql4 = "select count(ID) as totalCases, monthname(created) AS Month, EXTRACT(YEAR FROM created) AS year from ed_sandboxdb.Cases GROUP BY month , year ORDER BY year asc, STR_TO_DATE(month, '%M')"

sql5 = "SELECT count(distinct(d.ID)) as totalSessions,EXTRACT(YEAR FROM created) AS year FROM ed_sandboxdb.Depositions d group by year;"


mycursor0 = mysqldb.cursor(dictionary=True)
mycursor0.execute(sql0)
myresult0 = mycursor0.fetchall()

mycursor1 = mysqldb.cursor(dictionary=True)
mycursor1.execute(sql1)
myresult1 = mycursor1.fetchall()

mycursor2 = mysqldb.cursor(dictionary=True)
mycursor2.execute(sql2)
myresult2 = mycursor2.fetchall()

mycursor3 = mysqldb.cursor(dictionary=True)
mycursor3.execute(sql3)
myresult3 = mycursor3.fetchall()

mycursor4 = mysqldb.cursor(dictionary=True)
mycursor4.execute(sql4)
myresult4 = mycursor4.fetchall()

mycursor5 = mysqldb.cursor(dictionary=True)
mycursor5.execute(sql5)
myresult5 = mycursor5.fetchall()
# prettyprint("Migration started...", myresult)

# print(myresult1)
# print(myresult2)

# OverallDepositionStatSchema["yearlySessionsTotal"] = sum_sessions(myresult1["SessionsCount"]);

totalSessionsCount = 0
totalUsersCount = 0
totalCasesCount = 0
# res = dict()
# key, value = 'sessionsCategory', 'sessionsCategoryCount'

for index, result in enumerate(myresult0):
    totalSessionsCount = result['totalSessions']
    # print(totalSessionsCount)
    # totalUsersCount += result['totalUsers']

for index, result in enumerate(myresult1):
    # totalSessionsCount += result['totalSessions']
    totalUsersCount += result['totalUsers']

for index, result in enumerate(myresult4):
    # totalSessionsCount += result['totalSessions']
    totalCasesCount += result['totalCases']

OverallDepositionStatSchema["totalSessions"] = totalSessionsCount
OverallDepositionStatSchema["totalUsers"] = totalUsersCount
OverallDepositionStatSchema["totalCases"] = totalCasesCount


for index, result1 in enumerate(myresult1):
    OverallDepositionStatSchema["monthlyData"].append(result1)

for index, result2 in enumerate(myresult2):
    OverallDepositionStatSchema["dailyData"].append(result2)
for index, result2 in enumerate(myresult2):
    OverallDepositionStatSchema["dailyData"].append(result2)

for index, result3 in enumerate(myresult3):
    OverallDepositionStatSchema["sessionsCountByCategory"] .append(result3)

for index, result4 in enumerate(myresult4):
    OverallDepositionStatSchema["casesData"] .append(result4)

for index, result5 in enumerate(myresult5):
    print(result5)
    OverallDepositionStatSchema["yearlyData"].append(result5)
# print(OverallDepositionStatSchema)


if len(OverallDepositionStatSchema) > 0:
    # myresult comes from mysql cursor
    x = mycol.insert_one(OverallDepositionStatSchema)
    # print(len(x.inserted_ids))
