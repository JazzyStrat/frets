// can't do this because it's cross-origin resource
fetch('https://seattletimes.com/')
    .then((response) => response.text())
    .then((html) => {
        console.log(html)
    })

const tilly = {
    color: 'black',
    weight: 41,
}
