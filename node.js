var fs = require('fs');
var topology = './static/world-geo-pop.json';

fs.readFile(topology, 'utf8', function(err, data) {
    const parsedData = JSON.parse(data)
    parsedData.objects.units.geometries.map((d, i) => {
        const oldProperties = d.properties
        d.properties = {
            'sovereignty': oldProperties.sovereignt,
            'sov_a3': oldProperties.sov_a3,
            'type': oldProperties.type,
            'admin': oldProperties.admin,
            'adm0_a3': oldProperties.adm0_a3,
            'economy': oldProperties.economy,
            'income_grp': oldProperties.income_grp,
            'continent': oldProperties.continent,
            'region_un': oldProperties.region_un,
            'subregion': oldProperties.subregion
        }
    })
    writeFile(JSON.stringify(parsedData));
})

function writeFile(content) {
    fs.writeFile("./object.json", content, (err) => {
        if (err) {
            console.error(err);
            return;
        };
        console.log("File has been created");
    });
}
