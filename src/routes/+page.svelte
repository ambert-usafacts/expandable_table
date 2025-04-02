<script>
	// @ts-nocheck

	import { csvParse } from "d3-dsv";
	import { csv } from "d3-fetch";
	import data from "../data.csv";

	// ok, I need to figure out how to nest this data for use in the table.
	// for the moment, that is bureau nested inside agency with rollup totals.
	// ultimately, this probably shouldn't be part of the table functionality
	// but should instead be how the data is already structured when passed to this component

	let totalValueAllAgencies = 0;
	const nestedData = $derived.by(() => {
		const tempData = {};

		if (data) {
			data.forEach((row) => {
				const agencyName = row.agency_name;
				const bureauName = row.bureau;
				const programName = row.program;
				const value = parseFloat(row.value) || 0; // Ensure that value is a number

				// Initialize the agency if it doesn't exist
				if (!tempData[agencyName]) {
					tempData[agencyName] = {
						agency_name: agencyName,
						total_value: 0,
						bureaus: {},
					};
				}

				// Initialize the bureau if it doesn't exist within the agency
				if (!tempData[agencyName].bureaus[bureauName]) {
					tempData[agencyName].bureaus[bureauName] = {
						bureau_name: bureauName,
						total_value: 0,
						programs: [],
					};
				}

				// Add the current row's program and value to the corresponding bureau
				tempData[agencyName].bureaus[bureauName].programs.push({
					program: row.program,
					value: value,
				});

				// Update the totals at the bureau level
				tempData[agencyName].bureaus[bureauName].total_value += value;

				// Update the totals at the agency level
				tempData[agencyName].total_value += value;

				// Update the total value across all agencies (for global percent calculation)
				totalValueAllAgencies += value;
			});
		}

		// Step 2: Calculate percent of total for agencies, bureaus, and programs
		for (const agencyName in tempData) {
			const agency = tempData[agencyName];

			// Calculate the percent of total for this agency
			agency.percent_of_total =
				(agency.total_value / totalValueAllAgencies) * 100;

			for (const bureauName in agency.bureaus) {
				const bureau = agency.bureaus[bureauName];

				// Calculate the percent of total for this bureau
				bureau.percent_of_total =
					(bureau.total_value / totalValueAllAgencies) * 100;

				bureau.programs.forEach((program) => {
					// Calculate the percent of total for this program
					program.percent_of_total =
						(program.value / totalValueAllAgencies) * 100;
				});
			}
		}

		return tempData;
	});

	$effect(() => {
		console.log({ nestedData, totalValueAllAgencies });
	});
</script>

<table>
	<tbody>
		{#each Object.values(nestedData) as { agency_name, total_value, percent_of_total, bureaus }}
			<tr>
				<td>{agency_name}</td>
				<td>{total_value}</td>
				<td>{percent_of_total}</td>
			</tr>
		{/each}
	</tbody>
</table>
