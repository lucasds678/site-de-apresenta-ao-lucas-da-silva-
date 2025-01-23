const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuração de armazenamento para upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Pasta onde os arquivos serão salvos
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`; // Nome único para evitar conflitos
        cb(null, uniqueName);
    },
});

// Configuração de filtro de arquivos
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Apenas arquivos PDF, DOC ou DOCX são permitidos!'));
        }
        cb(null, true);
    },
});

// Middleware para servir arquivos estáticos (ex.: HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal para servir o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para download do currículo (arquivo exemplo)
app.get('/download-cv', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'curriculo.pdf'); // Certifique-se de que o arquivo esteja na pasta 'public'
    res.download(filePath, 'Curriculo_Nome.pdf', (err) => {
        if (err) {
            console.error('Erro ao fazer download do arquivo:', err.message);
            res.status(500).send('Erro ao fazer download do arquivo.');
        }
    });
});

// Rota de upload
app.post('/upload', upload.single('curriculo'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo foi enviado!');
    }
    res.send(`Currículo enviado com sucesso! Arquivo: ${req.file.filename}`);
});

// Middleware para lidar com erros do multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message) {
        return res.status(500).send(err.message);
    }
    next();
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
const nodemailer = require('nodemailer');

// Rota para envio de e-mail
app.post('/send-email', express.urlencoded({ extended: true }), (req, res) => {
    const { nome, email, mensagem } = req.body;

    // Configuração do transporte do Nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use o serviço de e-mail desejado (ex.: Gmail, Outlook)
        auth: {
            user: 'lucasds678@gmail.com', // Substitua pelo seu e-mail
            pass: 'sxa84611004' // Substitua pela sua senha ou app password
        }
    });

    // Configuração do e-mail
    const mailOptions = {
        from: email,
        to: 'lucasds678@gmail.com', // E-mail para onde a mensagem será enviada
        subject: `Nova mensagem de contato de ${nome}`,
        text: `Você recebeu uma nova mensagem:\n\nNome: ${nome}\nE-mail: ${email}\nMensagem: ${mensagem}`
    };

    // Enviar o e-mail
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Erro ao enviar o e-mail:', error);
            return res.status(500).send('Erro ao enviar a mensagem.');
        }
        console.log('E-mail enviado:', info.response);
        res.send('Mensagem enviada com sucesso!');
    });
});
