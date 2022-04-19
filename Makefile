deploy_217:
	rsync -avhzL --delete \
				--no-perms --no-owner --no-group \
				--exclude .git \
				--exclude .env \
				--exclude dist \
				--exclude tmp \
				--exclude node_modules \
				--exclude workers \
				--filter=":- .gitignore" \
				. sotatek@172.16.1.217:/var/www/oasis_launchpad/backend
	# ssh sotatek@172.16.1.212 "rm -rf node_modules/ package-lock.json"
	# ssh sotatek@172.16.1.212 "npm i && make all"
	ssh sotatek@172.16.1.217 "cd /var/www/oasis_launchpad/backend && pm2 restart app.json"

deploy_rinkeby_217:
	rsync -avhzL --delete \
				--no-perms --no-owner --no-group \
				--exclude .git \
				--exclude .env \
				--exclude dist \
				--exclude tmp \
				--exclude node_modules \
				--exclude workers \
				--filter=":- .gitignore" \
				. sotatek@172.16.1.217:/var/www/oasis_launchpad/backend_rinkeby
	# ssh sotatek@172.16.1.212 "rm -rf node_modules/ package-lock.json"
	# ssh sotatek@172.16.1.212 "npm i && make all"
	ssh sotatek@172.16.1.217 "cd /var/www/oasis_launchpad/backend_rinkeby && pm2 restart app_rinkeby.json"
