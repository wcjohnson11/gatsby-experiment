import { tsv, csv } from 'd3';

export default tsv('happy.tsv').then((data) => {
	const categories = data.columns;
	const categoryInfo = [];
	for (var i = 0; i < 4; i++) {
		categoryInfo.push(data.shift());
	}
	// remove populations less than 5 million
	const filteredData = data.filter((country) => country.population > 5000000);

	return { categories, categoryInfo, filteredData };
});
