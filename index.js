const express = require('express')
const puppeteer = require("puppeteer")

const app = express()

app.use(express.json())

app.get('/',  async (req, res) => {
    var { cep } = req.body
    if(cep.length == 8){
        endereco = await bot(cep)
        res.json(endereco)
    } else{
        return res.status(400).send("CEP invalido, use apenas numeros!")
    }
    
})

app.listen(3000, () => {
    console.log('-> Servidor ligado!')
})


async function bot(cep){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://buscacepinter.correios.com.br/app/endereco/index.php')

    await page.waitForSelector('#endereco');
    await page.evaluate((cep) => {
        document.querySelector('#endereco').value = cep;
        document.querySelector('#btn_pesquisar').click();
      }, cep);

    try {
        await page.waitForSelector('tbody > tr > td:nth-child(1)', {timeout: 1000})
    }
    catch {
        return { cep: "Not find"}
    }
    
    var endereco = await page.evaluate(async () => {
        var logradouro = await document.querySelector('tbody > tr > td:nth-child(1)').innerText
        var bairro = await document.querySelector('tbody > tr > td:nth-child(2)').innerText
        var UF = await document.querySelector('tbody > tr > td:nth-child(3)').innerText
        return {logradouro, bairro, UF}
    })

    await browser.close()

    return endereco

    
    // await browser.close();
}

