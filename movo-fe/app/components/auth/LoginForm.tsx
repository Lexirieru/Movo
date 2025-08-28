"use client"

interface LoginFormProps{
    switchToRegister: () => void
}

export default function LoginForm({switchToRegister}: LoginFormProps){
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault()
        console.log("Login...")
    }

    return(
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required 
                    className="mt-1 block w-full bg-gray-800/50 border border-gray-600 
                            rounded-md shadow-sm py-2 px-3 text-white focus:outline-none 
                            focus:ring-cyan-500 focus:border-cyan-500" />
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    required 
                    className="mt-1 block w-full bg-gray-800/50 border border-gray-600 
                            rounded-md shadow-sm py-2 px-3 text-white focus:outline-none 
                            focus:ring-cyan-500 focus:border-cyan-500" 
                />
            </div>
            <div className="text-center text-sm text-gray-400">
                <span>Dont't have an account? </span>
                <button
                    type="button"
                    onClick={switchToRegister}
                    className="font-medium text-cyan-400 hover:text-cyan-300"
                >Sign Up</button>
            </div>
            <div>
                <button type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-105 transition-transform"
                >
                    Sign In
                </button>
            </div>
        </form>
    )
}

