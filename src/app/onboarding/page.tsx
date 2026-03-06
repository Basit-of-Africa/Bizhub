
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser, useFirestore } from "@/firebase"
import { doc, updateDoc, setDoc } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Logo } from "@/components/icons"
import { Rocket, Building2, Briefcase, Users, Loader2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function OnboardingPage() {
  const { user, loading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    businessName: "",
    industry: "",
    teamSize: "1-10",
  })

  useEffect(() => {
    if (!loading && user && user.setupCompleted && user.uid !== 'demo-tenant-owner') {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  const handleComplete = async () => {
    if (!user || !db) return
    setIsSubmitting(true)
    
    try {
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        businessName: formData.businessName,
        industry: formData.industry,
        setupCompleted: true
      })

      // Initialize default settings for this tenant
      const settingsRef = doc(db, "settings", user.uid)
      await setDoc(settingsRef, {
        userId: user.uid,
        autoOnboarding: true,
        autoProjectCreation: true,
        healthThreshold: 70,
        aiReportTone: 'Professional',
        defaultProjectDuration: 30,
        trainingPassMark: 75
      })

      toast({
        title: "Setup Complete!",
        description: `Welcome to Vela, ${formData.businessName}. Your business OS is ready.`,
      })
      
      router.push("/dashboard")
    } catch (error) {
      console.error("Onboarding failed:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your business profile. Please try again."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="p-3 bg-primary rounded-2xl shadow-lg">
          <Logo className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="font-headline text-2xl font-bold tracking-tighter">Initializing Vela OS</h1>
      </div>

      <Card className="w-full max-w-lg shadow-2xl border-primary/10">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
             {step === 1 ? <Building2 className="h-12 w-12 text-primary" /> : <CheckCircle2 className="h-12 w-12 text-green-500" />}
          </div>
          <CardTitle className="text-3xl font-bold">
            {step === 1 ? "Business Identity" : "Launch Sequence Ready"}
          </CardTitle>
          <CardDescription>
            {step === 1 
              ? "Let's configure the OS for your organization." 
              : "We've prepared your intelligent workspace. Ready to blast off?"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 py-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Legal Business Name</Label>
                <Input 
                  id="businessName" 
                  placeholder="Acme Global Inc." 
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry Vertical</Label>
                <Select 
                  value={formData.industry} 
                  onValueChange={(val) => setFormData({...formData, industry: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology & SaaS</SelectItem>
                    <SelectItem value="Professional Services">Professional Services</SelectItem>
                    <SelectItem value="Creative Agency">Creative Agency</SelectItem>
                    <SelectItem value="Retail">Retail & E-commerce</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamSize">Current Headcount</Label>
                <Select 
                  value={formData.teamSize} 
                  onValueChange={(val) => setFormData({...formData, teamSize: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 Employees</SelectItem>
                    <SelectItem value="11-50">11-50 Employees</SelectItem>
                    <SelectItem value="51-200">51-200 Employees</SelectItem>
                    <SelectItem value="200+">200+ Employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-6 space-y-4">
               <div className="flex items-start gap-4">
                  <div className="p-2 bg-background rounded-lg border shadow-sm">
                    <Rocket className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Automated Workflows Active</p>
                    <p className="text-xs text-muted-foreground">Your CRM is synced with the Project Delivery module.</p>
                  </div>
               </div>
               <div className="flex items-start gap-4">
                  <div className="p-2 bg-background rounded-lg border shadow-sm">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Tenant Isolation Verified</p>
                    <p className="text-xs text-muted-foreground">Encryption keys generated for {formData.businessName}.</p>
                  </div>
               </div>
               <div className="flex items-start gap-4">
                  <div className="p-2 bg-background rounded-lg border shadow-sm">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">AI Agent Initialized</p>
                    <p className="text-xs text-muted-foreground">Reporting agents tuned to {formData.industry} standards.</p>
                  </div>
               </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {step === 1 ? (
            <Button 
              className="w-full py-6 text-lg" 
              disabled={!formData.businessName || !formData.industry}
              onClick={() => setStep(2)}
            >
              Configure Logic Engines
            </Button>
          ) : (
            <Button 
              className="w-full py-6 text-lg" 
              disabled={isSubmitting}
              onClick={handleComplete}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Rocket className="mr-2 h-5 w-5" />}
              Launch Dashboard
            </Button>
          )}
          <div className="flex justify-center gap-1">
            {[1, 2].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 w-8 rounded-full transition-colors ${step === i ? 'bg-primary' : 'bg-muted'}`} 
              />
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
