# Set the name of the Docker image
IMG_NAME=gfournieriexec/r3v3al

# Build the regular non-TEE image
docker build . -t ${IMG_NAME}

# Create input/output directories if they do not exist
if [ ! -d "./tmp/iexec_in" ]; then
  mkdir -p ./tmp/iexec_in
fi

if [ ! -d "./tmp/iexec_out" ]; then
  mkdir -p /tmp/iexec_out
fi

# Place your .zip file in the /tmp/iexec_in directory and replace DATA_FILENAME with the name of the file you just placed in the directory
# The .zip file should contain a file with the email content you want to protect
DATA_FILENAME="protectedData.zip"


IEXEC_REQUESTER_SECRET_1='{"PLAYER_PVK":"0x9751ba995669f09f31278bcb3e9eff9e4235935e16d217e3924d0c4910a76e83"}'
IEXEC_APP_DEVELOPER_SECRET='{"MC_PVK":"0xbf92d248bb64f851a0afacb6b7c2fdf271e3e5e32788d12294110ff1ff6c2277"}'

docker run -it --rm \
            -v /tmp/iexec_in:/iexec_in \
            -v /tmp/iexec_out:/iexec_out \
            -e IEXEC_IN=/iexec_in \
            -e IEXEC_OUT=/iexec_out \
            -e IEXEC_DATASET_FILENAME=${DATA_FILENAME} \
            -e IEXEC_APP_DEVELOPER_SECRET=${IEXEC_APP_DEVELOPER_SECRET} \
            -e IEXEC_REQUESTER_SECRET_1=${IEXEC_REQUESTER_SECRET_1} \
            ${IMG_NAME}