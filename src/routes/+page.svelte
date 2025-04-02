<script>
	// @ts-nocheck

	import { csvParse } from "d3-dsv";
	import { csv } from "d3-fetch";
	import data from "../data.csv";
	import { dollarFormat, percentFormat } from "../lib/utils.js";

	// ok, I need to figure out how to nest this data for use in the table.
	// for the moment, that is bureau nested inside agency with rollup totals.
	// ultimately, this probably shouldn't be part of the table functionality
	// but should instead be how the data is already structured when passed to this component

	let totalValueAllAgencies = 0;
	const nestedData = $derived.by(() => {
		const tempData = {};

		if (data) {
			const spendingOnly = data.filter((d) => d.level_1 === "Spending");
			spendingOnly.forEach((row) => {
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

			// If the agency has only one bureau and the bureau name matches the agency name, omit bureaus
			const bureauNames = Object.keys(agency.bureaus);
			if (bureauNames.length === 1 && bureauNames[0] === agencyName) {
				// Remove bureaus completely if the bureau name matches the agency name
				agency.bureaus = {}; // Set it to an empty array
			}

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

		// Step 3: Sort agencies in descending order of their total value
		const sortedNestedData = Object.keys(tempData)
			.map((agencyName) => tempData[agencyName]) // Convert the object to an array of agencies
			.sort((a, b) => b.total_value - a.total_value); // Sort by total_value in descending order

		// Rebuild the nestedData structure with sorted agencies
		const sortedData = {};
		sortedNestedData.forEach((agency) => {
			sortedData[agency.agency_name] = agency;
		});

		return sortedData;
	});

	const headers = ["Toggle", "Agency", "2024 Spending", "% of Total"];

	$effect(() => {
		console.log({ nestedData, totalValueAllAgencies });
	});
</script>

<table>
	<thead>
		<tr>
			{#each headers as header}
				{#if header === "Toggle"}
					<th><span class="visually-hidden">{header}</span></th>
				{:else}
					<th>{header}</th>
				{/if}
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each Object.values(nestedData) as { agency_name, total_value, percent_of_total, bureaus }}
			<tr>
				<td
					>{#if Object.entries(bureaus).length}
						HAS BUREAUS
					{:else}{/if}
				</td>
				<td>{agency_name}</td>
				<td>{dollarFormat(total_value)}</td>
				<td>{percentFormat(percent_of_total)}</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	/* Proven method to visually hide something but */
	/* still make it available to assistive technology */
	.visually-hidden {
		position: absolute;
		top: auto;
		overflow: hidden;
		clip: rect(1px 1px 1px 1px); /* IE 6/7 */
		clip: rect(1px, 1px, 1px, 1px);
		width: 1px;
		height: 1px;
		white-space: nowrap;
	}
</style>
