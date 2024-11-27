const express = require('express');
const fetch = require('node-fetch');
const https = require('https');
const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

let chalk;
(async () => {
    chalk = (await import('chalk')).default;
})();

const app = express();
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = 3000;

const myHeaders = new fetch.Headers();
myHeaders.append("accept", "application/json, text/plain, */*");
myHeaders.append("accept-language", "pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6");
myHeaders.append("authorization", "Bearer Zklb8xl-B0JbBOYP1nzBfVSxiw7Olls556vfF99Bk6I");
myHeaders.append("cache-control", "no-cache");
myHeaders.append("cookie", "_fbp=fb.1.1719579174603.329281081909644403; _tt_enable_cookie=1; _pin_unauth=dWlkPU5XUm1aamt6Tm1RdE0yVXlOaTAwTXpaaUxUa3dNekF0TkROa1pqUTRNelZtWVdWaQ; rdtrk=%7B%22id%22%3A%223b54b61b-8ca7-4a5c-8e1a-66021b9a6d74%22%7D; _hjSessionUser_2843920=eyJpZCI6IjE1MTIwNGVjLTliMzYtNWFlNS1iZWY2LWQyMTczN2FhMDM0NCIsImNyZWF0ZWQiOjE3MTk1NzkxNzQ4MDgsImV4aXN0aW5nIjp0cnVlfQ==; __trf.src=encoded_eyJmaXJzdF9zZXNzaW9uIjp7InZhbHVlIjoiKG5vbmUpIiwiZXh0cmFfcGFyYW1zIjp7fX0sImN1cnJlbnRfc2Vzc2lvbiI6eyJ2YWx1ZSI6Imh0dHBzOi8vc3RhdGljcy50ZWFtcy5jZG4ub2ZmaWNlLm5ldC8iLCJleHRyYV9wYXJhbXMiOnt9fSwiY3JlYXRlZF9hdCI6MTcyNjA3MzcxMDAxOH0=; _ga=GA1.1.529948849.1719579175; _ga_XR36QFMF16=GS1.1.1728489009.7.0.1728489009.0.0.0; apt.uid=AP-YFGMCGUNNIFB-2-1728655004262-22794838.0.2.6b933aba-006b-4c12-b4b5-a0ddc2adfcf4; _gcl_au=1.1.389810717.1732039108; _ttp=vVVBfLjNKMlAK0jwo0O6BxOo8IX.tt.1; _ga_Z1SEVXH7G0=GS1.1.1732039108.3.1.1732039155.13.0.0; _ga_SGV4G5CF0W=GS1.1.1732039108.3.1.1732039155.13.0.0; rxVisitor=1729715722202SG9U634O43I8KG631B6GPT7BE2O8TISF");
myHeaders.append("pragma", "no-cache");
myHeaders.append("priority", "u=1, i");
myHeaders.append("referer", "https://openshift.sp.senac.br/console/projects");
myHeaders.append("sec-ch-ua", "\"Microsoft Edge\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"");
myHeaders.append("sec-ch-ua-mobile", "?0");
myHeaders.append("sec-ch-ua-platform", "\"Windows\"");
myHeaders.append("sec-fetch-dest", "empty");
myHeaders.append("sec-fetch-mode", "cors");
myHeaders.append("sec-fetch-site", "same-origin");
myHeaders.append("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0");

const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
    agent: new https.Agent({
        rejectUnauthorized: false
    })
};

const podStates = {};

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

async function listPods(projectName, isFirstRead = false) {
    try {
        const startTime = Date.now(); // Start time
        const response = await fetch(`https://openshift.sp.senac.br/api/v1/namespaces/${projectName}/pods`, requestOptions);
        const endTime = Date.now(); // End time
        const responseTime = endTime - startTime; // Calculate response time

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const pods = data.items.map(pod => ({
            name: pod.metadata.name,
            phase: pod.status.phase
        }));

        if (!podStates[projectName]) {
            podStates[projectName] = {};
        }

        let stateChanged = false;
        let firstChange = true;
        pods.forEach(pod => {
            const prevState = podStates[projectName][pod.name];
            if (!prevState || prevState.phase !== pod.phase) {
                if (!isFirstRead && firstChange) {
                    process.stdout.write('\n'); // Start a new line for the first state change
                    firstChange = false;
                }
                console.log(chalk.hex('#FF00FF')(`Pod ${pod.name} in project ${projectName} changed phase from ${prevState ? prevState.phase : 'unknown'} to ${pod.phase}`));
                podStates[projectName][pod.name] = pod;
                stateChanged = true;

                // Send pod state change to WebSocket clients
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        if (!pod.name.includes('-build') || pod.phase === 'Running' || pod.phase === 'Succeeded') {
                            client.send(JSON.stringify({
                                projectName,
                                podName: pod.name,
                                previousPhase: prevState ? prevState.phase : 'unknown',
                                currentPhase: pod.phase
                            }));
                        }
                    }
                });
            }
        });

        if (isFirstRead) {
            console.log(`Loading Pod info :${projectName}, Date: ${new Date().toLocaleString()}, Response Time: ${responseTime}ms`);
        } else if (!stateChanged) {
            const firstLetter = projectName.charAt(0).toLowerCase();
            if (responseTime < 120) {
                //process.stdout.write(chalk.greenBright(firstLetter));
            } else if (responseTime < 150) {
                //process.stdout.write(chalk.hex('#FFA500')(firstLetter)); // Orange color
            } else {
                //process.stdout.write(chalk.hex('#FF00FF')(firstLetter));
            }
        }

        return pods;
    } catch (error) {
        console.error(`Fetch error for project ${projectName}:`, error);
        return [];
    }
}

async function monitorInterval(projectsToMonitor, projectData) {
    for (const [index, name] of projectsToMonitor.entries()) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const pods = await listPods(name);
        projectData[name].pods = pods; // Add pods to project data
    }
}

const ignoredProjects = ['openshift-monitoring', 'openshift-node','openshift-sdn']; // List of projects to ignore

async function listProjects() {
    try {
        const allProjects = process.argv.includes('-allprojects');
        const response = await fetch("https://openshift.sp.senac.br/apis/project.openshift.io/v1/projects", requestOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const projectNames = data.items.map(project => project.metadata.name);

        // Filter out ignored projects
        const filteredProjectNames = projectNames.filter(name => !ignoredProjects.includes(name));

        // Initialize project data with basic info
        const projectData = {};
        for (const name of filteredProjectNames) {
            projectData[name] = { name, pods: await listPods(name, true) }; // Add pods to project data
        }

        // Save the response JSON to a file
        fs.writeFileSync(path.join(__dirname, 'ProjectList.json'), JSON.stringify(projectData, null, 2));

        let projectsToMonitor;
        if (allProjects) {
            projectsToMonitor = filteredProjectNames;
        } else {
            // Read the projects to monitor from the properties file
            const monitorProjects = fs.readFileSync(path.join(__dirname, 'monitor.properties'), 'utf8').split('\n').map(line => line.trim());
            // Filter the projects to monitor
            projectsToMonitor = filteredProjectNames.filter(name => monitorProjects.includes(name));
        }

        // Create a handler to monitor projects periodically
        const monitorProjectsPeriodically = async () => {
            await monitorInterval(projectsToMonitor, projectData);
            process.stdout.write('⏸'); // Print "⏸" for the pause
            setTimeout(monitorProjectsPeriodically, 10000); // Pause for 10 seconds after all projects are monitored
        };

        monitorProjectsPeriodically(); // Start the monitoring process

        return projectData;
    } catch (error) {
        console.error('Fetch error:', error);
        return {};
    }
}

app.get('/projects', async (req, res) => {
    const projects = await listProjects();
    res.json(projects);
});

app.get('/projects/:projectName/pods', async (req, res) => {
    const projectName = req.params.projectName;
    const pods = await listPods(projectName);
    res.json(pods);
});

server.listen(port, async () => {
    console.log(`API listening at http://localhost:${port}`);

    // Start the monitoring process
    const projectData = await listProjects();
    const projectsToMonitor = Object.keys(projectData);

    const monitorProjectsPeriodically = async () => {
        await monitorInterval(projectsToMonitor, projectData);
        process.stdout.write('⏸'); // Print "⏸" for the pause
        setTimeout(monitorProjectsPeriodically, 10000); // Pause for 10 seconds after all projects are monitored
    };

    monitorProjectsPeriodically(); // Start the monitoring process
});