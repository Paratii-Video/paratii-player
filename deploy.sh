#!/bin/bash
ssh paratii@build.paratii.video 'build_and_deploy.sh </dev/null >/var/log/build_and_deploy.log 2>&1 &'
