alias v="vagrant"
alias swift="xcrun swift"
alias swiftc="xcrun swiftc"
alias nrun="npm run"

function mkcd {
  if [ ! -n "$1" ]; then
    echo "Enter a directory name"
  elif [ -d $1 ]; then
    echo "\`$1' already exists"
  else
    mkdir $1 && cd $1
  fi
}

cdp () {
    TEMP_PWD=`pwd`
    while ! [ -d .git ]; do
        cd ..
    done
    OLDPWD=$TEMP_PWD
}
