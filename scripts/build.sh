#!/bin/bash

ssh -i $GCP_SSH_PRIVATE_KEY ${GCP_VM_USER}@${GCP_VM_IP}
cat /etc/os-release
exit