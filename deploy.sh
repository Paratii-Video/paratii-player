#!/bin/bash
# the 'build_and_deploy.sh' referred to in this script is https://github.com/Paratii-Video/devops/blob/master/files/build_and_deploy.sh
ssh paratii@build.paratii.video '~/build_and_deploy.sh </dev/null >build_and_deploy.log 2>&1 &'
