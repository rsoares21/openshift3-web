const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const https = require('https');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/projects', async (req, res) => {
    const myHeaders = new fetch.Headers();
    myHeaders.append("accept", "application/json, text/plain, */*");
    myHeaders.append("accept-language", "pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6");
    myHeaders.append("authorization", "Bearer mwTdkxb9YMQXi4DmDtoKwn7SpgLaXDluzTpu5dEkRAY");
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

    try {
        const response = await fetch("https://openshift.sp.senac.br/apis/project.openshift.io/v1/projects", requestOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/projects/:project/pods', async (req, res) => {
    const { project } = req.params;
    const myHeaders = new fetch.Headers();
    myHeaders.append("accept", "application/json, text/plain, */*");
    myHeaders.append("accept-language", "pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6");
    myHeaders.append("authorization", "Bearer mwTdkxb9YMQXi4DmDtoKwn7SpgLaXDluzTpu5dEkRAY");
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

    try {
        const response = await fetch(`https://openshift.sp.senac.br/api/v1/namespaces/${project}/pods`, requestOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const pods = data.items.map(pod => ({
            name: pod.metadata.name,
            phase: pod.status.phase
        }));
        res.json(pods);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});