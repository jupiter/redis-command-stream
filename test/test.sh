#!/bin/sh

echo "Loading fixures..."
cat ./test/fixtures.txt | redis-cli --pipe > /dev/null
echo "Saving as CLI commands..."
bin/redis-command-stream --flushdb "_*" > /tmp/nrs_test_default.txt
echo "Loading CLI commands..."
cat /tmp/nrs_test_default.txt | redis-cli -n 10
echo "Saving as protocol commands..."
bin/redis-command-stream --flushdb --pipe > /tmp/nrs_test_pipe.txt
echo "Loading protocol commands..."
cat /tmp/nrs_test_pipe.txt | redis-cli -n 11 --pipe
