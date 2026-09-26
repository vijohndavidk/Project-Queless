import pymysql

# Django's MySQL backend normally requires the 'mysqlclient' package,
# which needs system-level build tools (a C compiler + MySQL dev headers)
# and can be a pain to install, especially on Windows.
#
# PyMySQL is a pure-Python MySQL driver that installs anywhere with pip.
# This line tells it to masquerade as MySQLdb so Django's mysql backend
# is happy using it instead.
pymysql.install_as_MySQLdb()
