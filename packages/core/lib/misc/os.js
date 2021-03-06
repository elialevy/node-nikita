// Generated by CoffeeScript 2.5.1
  // # Misc OS

// Shell command to print archictecture, OS name and version release to stdout. The
  // following plateform are supported:

// * RH6 (RedHat, CentOS, Oracle)
  // * RH7 (RHEL, CentOS, Oracle)
  // * Ubuntu/Debian
  // * Arch Linux
module.exports = `ARCH=$(uname -m | sed 's/x86_//;s/i[3-6]86/32/')
# Red Hat and CentOS
if [ -f /etc/redhat-release ]; then
  # CentOS: 'CentOS release 6.8 (Final)'
  # RedHat: 'Red Hat Enterprise Linux AS release 3 (Taroon)'
  # Oracle: todo
  OS=\`cat /etc/redhat-release | sed 's/^\\(Red \\)\\?\\([A-Za-z]*\\).*/\\1\\2/'\`
  VERSION=\`cat /etc/redhat-release | sed 's/.* \\([0-9]\\)\\(\\(\\.*[0-9]\\)*\\) .*/\\1\\2/'\`
# Debian and Ubuntu
elif [ -f /etc/lsb-release ]; then
    . /etc/lsb-release
    OS=$DISTRIB_ID
    VERSION=$DISTRIB_RELEASE
# Arch Linux
elif uname -r | egrep 'ARCH$' >/dev/null; then
    OS=arch
    VERSION=\`uname -r | sed 's/\\(.*\\)-ARCH/\\1/'\`
else
  exit 2
fi
OS=\`echo $OS | tr '[:upper:]' '[:lower:]'\`
echo -n "$ARCH|$OS|$VERSION"`;
