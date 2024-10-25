'use client'

import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Image from "next/image";

export default function Home() {
  const [username, setUsername] = useState("")
  const [roast, setRoast] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const Roast = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      setError(null)
      setRoast("")

      // Get Profile Github
      const response = await fetch(`https://api.github.com/users/${username}`)

      if (!response.ok) {
        throw new Error("user github tidak ditemukan boss❌")
      }

      const data = await response.json()
      // console.log(data)

      // Get Repositories
      const repoResponse = await fetch(`https://api.github.com/users/${username}/repos`)
      const repoData = await repoResponse.json()

      const repos = repoData.map(repo => `
        Nama Repo: ${repo.name || 'Tidak ada nama repo'}
        Pemilik: ${repo.owner.login || 'Tidak ada pemilik repo'}
        Deskripsi: ${repo.description || 'Tidak ada deskripsi'}
        Fork: ${repo.fork ? 'Ya' : 'Tidak'}
        Jumlah Bintang: ${repo.stargazers_count || 0}
        Jumlah Pengamat: ${repo.watchers_count || 0}
        Visibilitas: ${repo.visibility || 'Tidak ada visibilitas'}
        Bahasa: ${repo.language || 'Tidak ada bahasa'}
        Jumlah Forks: ${repo.forks_count || 0}
      `).join('\n\n')
      // console.log(repos)

      // Get ReadMe
      const readmeResponse = await fetch(`https://raw.githubusercontent.com/${username}/${username}/main/README.md`)
      let readmeData = ""

      if (readmeResponse.ok) {
        readmeData = await readmeResponse.text()
      } else {
        readmeData = 'Tidak ada ReadMe (kayaknya dia malas buat ya!)'
      }
      // console.log(readmeData)

      // ROAST🔥
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const prompt = `Kamu adalah seorang developer yang lucu dan sarkastis, bertugas untuk "meledek" profil GitHub. Ledek profil GitHub berikut dengan cara yang lucu dan menyakitkan hati sedikit tidak apa apa:

        Username: ${data.login}
        Nama: ${data.name || 'Tidak disediakan'}
        Bio: ${data.bio || 'Tidak ada bio (mungkin terlalu keren untuk dideskripsikan)'}
        Personal Website: ${data.blog || 'Tidak ada Personal Website (kayaknya ga kreatif dia)'}
        Repo Publik: ${data.public_repos}
        Public Gists: ${data.public_gists}
        Email: ${data.email}
        Company: ${data.company}
        Location: ${data.location}
        Pengikut: ${data.followers}
        Mengikuti: ${data.following}
        Akun Dibuat: ${new Date(data.created_at).toLocaleDateString('id-ID')}
        Readme: ${readmeData}
        Repositories: ${repos}
        
        Buat lelucon tentang:
        Jumlah repositori mereka (terlalu banyak? terlalu sedikit?)
        Rasio pengikut dan yang diikuti
        Berapa lama mereka sudah di GitHub
        Bio mereka (atau ketiadaannya)
        Isi konten Readme mereka
        Repositories mereka
        Detail menarik lainnya yang kamu perhatikan

        Jangan ragu ragu untuk meledek.
        
        Pastikan seluruh responsmu dalam bahasa Indonesia yang santai dan gaul (Gunakan bahasa "gue" "lu").`

      const result = await model.generateContent(prompt)
      // console.log(result.response.text())
      setRoast(result.response.text())

    } catch (error) {
      console.error("Error:", error)
      setError(error.message) 
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex justify-center py-20 px-5 xl:px-0 overflow-hidden">
      <div className="w-[50rem] flex flex-col items-center relative">
        <Image 
          src='/assets/mesh.png'
          alt="image"
          width={1000}
          height={1000}
          className="absolute translate-x-[30rem] z-0"
        />
        <h1 className="text-3xl sm:text-5xl font-bold mb-5 text-center font-jacquard text-slate-700 tracking-tighter z-10">🔥Roasting Github🔥</h1>
        <form onSubmit={(e) => Roast(e)} className="flex flex-col w-full gap-2 my-10 z-10">
          <input 
            type="text"
            placeholder="Username Github"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border-2 border-sky-200 px-4 py-2 rounded outline-3 outline-sky-400 font-medium text-slate-700"
            required
          />
          {error && (
            <div className="text-red-500 font-medium">
              <p>{error}</p>
            </div>
          )}
          <button 
            type="submit" 
            disabled={loading} 
            className="bg-slate-700 text-white font-bold p-2 rounded hover:opacity-80 disabled:opacity-80 transition-all"
          >
            {loading ? "loading bos..." : "Roast🔥"}
          </button>
        </form>

        {!loading ? 
          (
            <div className="w-full text-justify z-10">
              <h1 className="font-medium text-slate-700 font-[family-name:var(--font-geist-mono)] leading-loose">
                {roast.split(/\*\*(.*?)\*\*/g).map((part, i) =>
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                )}
              </h1>
            </div>
          )
          :
          <div className="grid grid-cols-5 gap-3 w-full animate-pulse z-10">
            <div className="col-span-5 h-5 rounded-full bg-sky-100"></div>
            <div className="col-span-4 h-5 rounded-full bg-sky-100"></div>
            <div className="col-span-1 h-5 rounded-full bg-sky-100"></div>
            <div className="col-span-2 h-5 rounded-full bg-sky-100"></div>
            <div className="col-span-3 h-5 rounded-full bg-sky-100"></div>
            <div className="col-span-3 h-5 rounded-full bg-sky-100"></div>
            <div className="col-span-2 h-5 rounded-full bg-sky-100"></div>
            <div className="col-span-4 h-5 rounded-full bg-sky-100"></div>
          </div>
        }
      </div>
    </div>
  );
}
