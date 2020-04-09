# Load custom functions
USER_FNS=$ZSH/custom/fns
mkdir -p $USER_FNS
fpath=($USER_FNS $USER_FNS-autoload $fpath)
# Autoload and init functions
for f in $USER_FNS/*; do
  FUNC_NAME=`basename $f`
  autoload -Uz $FUNC_NAME
done
for f in $USER_FNS-autoload/*; do
  FUNC_NAME=`basename $f`
  echo "Autoloading function" $FUNC_NAME
  autoload -Uz $FUNC_NAME
  $FUNC_NAME
done
