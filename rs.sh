a=`netstat -aon|findstr "3000"|awk -F ' ' '{print $5}'|head -n 1`
taskkill -F /pid $a
