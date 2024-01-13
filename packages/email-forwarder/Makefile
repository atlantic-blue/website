GOPATH:=$(shell go env GOPATH)
SERVICE=email-forwarder

.PHONY: install
install:
	go mod download

.PHONY: lint
lint:
	@ [ -e ./bin/golangci-lint ] || wget -O - -q https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s latest
	./bin/golangci-lint run

.PHONY: zip
zip: build
	zip $(SERVICE).zip $(SERVICE)

.PHONY: build
build:
	GOARCH=amd64 GOOS=linux CGO_ENABLED=0 go build -o $(SERVICE)

dev-build:
	CGO_ENABLED=0 go build -o $(SERVICE)

.PHONY: dev
dev:
	go run .