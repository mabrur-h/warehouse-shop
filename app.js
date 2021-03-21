const fs = require('fs').promises;
const path = require('path');

class Shop {
    constructor(fileName) {
        this.fileName = fileName;
        this.filePath = path.join(__dirname, 'db', `${fileName}.json`);
        this.#initialMethod(fileName);
        this.keys = process.argv
    }

    async #initialMethod(fileName) {
        let checkFile = await this.#checkFile(fileName);
        // if path exists don't overwrite
        if ( !checkFile ) await this.#createFolder(fileName, checkFile);
    }

    async #createFolder(checkFile) {
        try {
            let folderPath = path.join(__dirname, 'db');
            // if file exists don't overwrite
            if ( !checkFile ) {
                let res = await fs.mkdir(folderPath);
            }
            await this.#createFile();
        } catch (e) {
            await this.#createFile();
        }
    }

    async #createFile() {
        try {
            let res = await fs.writeFile(this.filePath, JSON.stringify({products: []}));
        } catch (e) {
            await this.#createFolder();
        }
    }

    async #checkFile(fileName) {
        try {
            let folderPath = path.join(__dirname, 'db', `${fileName}.json`);
            let res = await fs.readFile(folderPath);
            return true;
        } catch (e) {
            return false;
        }
    }

    async #readFile () {
        try {
            let filePath = path.join(__dirname, 'db', this.fileName+'.json');
            // read and decode created file
            let res = await fs.readFile(filePath, {
                encoding: "utf-8"
            })
            return await JSON.parse(res);
        } catch (e) {
            await this.#createFolder();
        }
    }

    async dep(productName, productCount) {
        try {
            productCount = parseInt(productCount)
            productCount -= 0;

            let data = await this.#readFile();
            if ( !(JSON.stringify(data).includes(productName)) ) {
                // push products to json file
                data.products.push({
                    id: data.products.length + 1,
                    productName: productName,
                    initialCount: productCount,
                    sold: 0,
                    remainingProduct: productCount
                })
                console.log(`You have successfully added ${productCount} ${productName}!`)
                // save push data to json
                await this.#saveData(data);
            } else {
                console.log (`${productName} already exists!`)
            }

        } catch (e) {
            console.log('Ooops! Something went wrong, please try again!')
        }
    }

    async sell(productName, sellCount) {
        try {
            let data = await this.#readFile()
            let filtered = await this.#filter(productName)
            // count remaining product in warhouse
            filtered[0]["remainingProduct"] = filtered[0]["initialCount"] - filtered[0]["sold"]
            // remaining product can't be equal to zero
            if(filtered[0]["remainingProduct"] === 0) {
                console.log (`All ${productName}s are sold out!`)
            }
            else if(sellCount > filtered[0]["remainingProduct"]) {
                console.log (`There is only ${filtered[0]["remainingProduct"]} ${productName} in warhouse!`)
            } else if (sellCount <= filtered[0]["remainingProduct"]) {
                // count sold and remaining products
                filtered[0]["sold"] += sellCount
                filtered[0]["remainingProduct"] = filtered[0]["initialCount"] - filtered[0]["sold"]
                console.log (`${sellCount} ${productName} successfully sold!`)
            }
            for (let i = 0; i < data.products.length; i++) {
                if (data.products[i]["productName"] === productName) {
                    data.products[i] = filtered[0];
                }
            }
            await fs.writeFile(this.filePath, JSON.stringify(data))
        } catch (e) {
            console.log('Ooops! Something went wrong, please try again!')
        }
    }

    async getData() {
        try {
            let res = await this.#readFile();
            console.log (res);
        } catch (e) {
            console.log (e+'');
        }
    }

    async #filter(productName) {
        try {
            let data = await this.#readFile();
            return data.products.filter ( (item) => item['productName'] === productName )
        } catch (e) {
            console.log('Ooops! Something went wrong, please try again!')
        }
    }

    async #saveData(data) {
        try {
            let filePath = path.join(__dirname, 'db', this.fileName+'.json');
            data = JSON.stringify(data);
            await fs.writeFile(filePath, data);
        } catch (e) {
            console.log('Ooops! Something went wrong, please try again!')
        }
    }

    async dash() {
        try {
            let data = await  this.#readFile();
            console.table(data.products);
        } catch (e) {
            console.log('Ooops! Something went wrong, please try again!');
        }
    }

}

module.exports = Shop
